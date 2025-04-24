import json
from typing import List, Optional
import boto3
from models import SongDetails, SongResponse
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class MinioService:
    def __init__(self):
        self.endpoint = os.getenv("MINIO_ENDPOINT", "http://gemdekaise.go.ro:9007")
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "admin")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "admin123")
        self.bucket = os.getenv("MINIO_BUCKET", "melodii")
        
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name="us-east-1"
        )

    def get_metadata(self) -> List[SongDetails]:
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket, 
                Key="metadata/metadata.json"
            )
            metadata_content = response['Body'].read().decode('utf-8')
            return [SongDetails(**item) for item in json.loads(metadata_content)]
        except Exception as e:
            print(f"Error fetching metadata: {e}")
            return []

    def get_download_url(self, s3_key: str) -> Optional[str]:
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': s3_key
                },
                ExpiresIn=3600  # URL valid for 1 hour
            )
            return url
        except Exception as e:
            print(f"Error generating download URL: {e}")
            return None

class SongService:
    def __init__(self, minio_service: MinioService):
        self.minio_service = minio_service
        self.songs: List[SongDetails] = []

    def refresh_songs(self):
        self.songs = self.minio_service.get_metadata()

    def get_all_songs(self) -> List[SongDetails]:
        return self.songs

    def get_song_by_title(self, title: str) -> Optional[SongDetails]:
        return next((song for song in self.songs if song.title == title), None)

    def get_songs_by_artist(self, artist: str) -> List[SongDetails]:
        return [song for song in self.songs if song.artist.lower() == artist.lower()]

    def get_songs_by_genre(self, genre: str) -> List[SongDetails]:
        return [song for song in self.songs if song.genre.lower() == genre.lower()] 