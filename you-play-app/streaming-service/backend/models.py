from typing import List, Optional
from pydantic import BaseModel

class SongBase(BaseModel):
    title: str
    artist: str
    genre: str
    duration: int

class SongDetails(SongBase):
    file_path: str
    s3_key: str

class SongResponse(SongBase):
    pass

class SongDownloadResponse(BaseModel):
    download_url: str
    title: str 