import os
import threading
import time
from fastapi import FastAPI, HTTPException, Depends
from contextlib import asynccontextmanager
from backend.services import MinioService, SongService
from backend.models import SongResponse, SongDownloadResponse
from backend.auth import verify_token
from typing import List
from dotenv import load_dotenv
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

minio_service = MinioService()
song_service = SongService(minio_service)

def sync_metadata():
    while True:
        try:
            song_service.refresh_songs()
        except Exception as e:
            print(f"Error in sync thread: {e}")
        time.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    sync_thread = threading.Thread(target=sync_metadata, daemon=True)
    sync_thread.start()
    yield

app = FastAPI(title="Streaming Service API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/songs", response_model=List[SongResponse])
async def get_songs(token_data: dict = Depends(verify_token)):
    return song_service.get_all_songs()

@app.get("/songs/artist/{artist}", response_model=List[SongResponse])
async def get_songs_by_artist(artist: str, token_data: dict = Depends(verify_token)):
    songs = song_service.get_songs_by_artist(artist)
    if not songs:
        raise HTTPException(status_code=404, detail=f"No songs found for artist: {artist}")
    return songs

@app.get("/songs/genre/{genre}", response_model=List[SongResponse])
async def get_songs_by_genre(genre: str, token_data: dict = Depends(verify_token)):
    songs = song_service.get_songs_by_genre(genre)
    if not songs:
        raise HTTPException(status_code=404, detail=f"No songs found for genre: {genre}")
    return songs

@app.get("/song/{title}", response_model=SongDownloadResponse)
async def get_song_download(title: str, token_data: dict = Depends(verify_token)):
    song = song_service.get_song_by_title(title)
    if not song:
        raise HTTPException(status_code=404, detail=f"Song not found: {title}")
    
    download_url = minio_service.get_download_url(song.s3_key)
    if not download_url:
        raise HTTPException(status_code=500, detail="Failed to generate download URL")
    
    return SongDownloadResponse(
        download_url=download_url,
        title=song.title
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT) 