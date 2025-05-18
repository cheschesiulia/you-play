from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User, Song, ListeningHistory, ListeningHistoryCreate, UserPlaylistResponse, SongBase, liked_songs
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import os
import uvicorn

def wait_for_db(retries=5, delay=2):
    """Wait for database to be ready before starting the application"""
    for attempt in range(retries):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError as e:
            if attempt == retries - 1:
                raise e
            print(f"Database not ready. Retrying in {delay} seconds...")
            time.sleep(delay)

wait_for_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/test/cleanup")
async def cleanup_database(db: Session = Depends(get_db)):
    """Clean up the database (test purposes only)"""
    try:
        db.query(ListeningHistory).delete()
        
        db.execute(liked_songs.delete())
        
        db.query(Song).delete()
        
        db.query(User).delete()
        
        db.commit()
        return {"message": "Database cleaned successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error cleaning database: {str(e)}")

@app.post("/listening-history")
async def add_to_history(history: ListeningHistoryCreate, db: Session = Depends(get_db)):
    """Add a new song to user's listening history"""
    user = db.query(User).filter(User.username == history.username).first()
    if not user:
        user = User(username=history.username)
        db.add(user)
        db.commit()
    
    song = db.query(Song).filter(Song.title == history.song_title).first()
    if not song:
        song = Song(
            title=history.song_title,
            artist="Unknown",
            genre="Unknown"
        )
        db.add(song)
        db.commit()
    
    history_entry = ListeningHistory(
        user_username=history.username,
        song_title=history.song_title,
        listened_at=datetime.utcnow()
    )
    db.add(history_entry)
    db.commit()
    
    return {"message": "Listening history updated successfully"}

@app.post("/like-song/{username}/{song_title}")
async def like_song(username: str, song_title: str, db: Session = Depends(get_db)):
    """Add a song to user's liked songs list"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username)
        db.add(user)
    
    song = db.query(Song).filter(Song.title == song_title).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    if song not in user.liked_songs:
        user.liked_songs.append(song)
        db.commit()
        return {"message": "Song added to liked songs"}
    return {"message": "Song already in liked songs"}

@app.delete("/unlike-song/{username}/{song_title}")
async def unlike_song(username: str, song_title: str, db: Session = Depends(get_db)):
    """Remove a song from user's liked songs list"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    song = db.query(Song).filter(Song.title == song_title).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    if song in user.liked_songs:
        user.liked_songs.remove(song)
        db.commit()
        return {"message": "Song removed from liked songs"}
    return {"message": "Song was not in liked songs"}

@app.get("/liked-songs/{username}", response_model=List[SongBase])
async def get_liked_songs(username: str, db: Session = Depends(get_db)):
    """Get all liked songs for a user"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.liked_songs

@app.get("/listening-history/{username}")
async def get_user_history(username: str, db: Session = Depends(get_db)):
    """Get user's listening history, ordered by most recent first"""
    history = db.query(ListeningHistory)\
        .filter(ListeningHistory.user_username == username)\
        .order_by(ListeningHistory.listened_at.desc())\
        .all()
    
    return history

@app.get("/recommendations/{username}", response_model=List[SongBase])
async def get_recommendations(username: str, db: Session = Depends(get_db)):
    """
    Recommend songs for a user based on their liked songs and listening history.
    Recommends songs by similar artists or genres, excluding already liked/listened songs.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    liked = user.liked_songs
    history_entries = db.query(ListeningHistory).filter(ListeningHistory.user_username == username).all()
    history_titles = set(entry.song_title for entry in history_entries)

    preferred_genres = set(song.genre for song in liked if song.genre)
    preferred_artists = set(song.artist for song in liked if song.artist)
    for entry in history_entries:
        song = db.query(Song).filter(Song.title == entry.song_title).first()
        if song:
            if song.genre:
                preferred_genres.add(song.genre)
            if song.artist:
                preferred_artists.add(song.artist)

    exclude_titles = set(song.title for song in liked) | history_titles

    query = db.query(Song).filter(~Song.title.in_(exclude_titles))
    if preferred_genres or preferred_artists:
        query = query.filter(
            (Song.genre.in_(preferred_genres)) | (Song.artist.in_(preferred_artists))
        )
    recommendations = query.limit(10).all()

    return recommendations

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 