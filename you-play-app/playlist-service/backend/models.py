from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

Base = declarative_base()

# Association table for liked songs
liked_songs = Table(
    'liked_songs',
    Base.metadata,
    Column('user_id', String, ForeignKey('users.username')),
    Column('song_id', String, ForeignKey('songs.title'))
)

class User(Base):
    __tablename__ = 'users'
    username = Column(String, primary_key=True)
    listening_history = relationship("ListeningHistory", back_populates="user")
    liked_songs = relationship("Song", secondary=liked_songs, backref="liked_by")

class Song(Base):
    __tablename__ = 'songs'
    title = Column(String, primary_key=True)
    artist = Column(String)
    genre = Column(String)
    listening_history = relationship("ListeningHistory", back_populates="song")

class ListeningHistory(Base):
    __tablename__ = 'listening_history'
    id = Column(Integer, primary_key=True)
    user_username = Column(String, ForeignKey('users.username'))
    song_title = Column(String, ForeignKey('songs.title'))
    listened_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="listening_history")
    song = relationship("Song", back_populates="listening_history")

# Pydantic models for API
class SongBase(BaseModel):
    title: str
    artist: str
    genre: str

class ListeningHistoryCreate(BaseModel):
    username: str
    song_title: str

class ListeningHistoryResponse(BaseModel):
    song_title: str
    listened_at: datetime

    class Config:
        orm_mode = True

class UserPlaylistResponse(BaseModel):
    username: str
    liked_songs: List[SongBase]

    class Config:
        orm_mode = True 