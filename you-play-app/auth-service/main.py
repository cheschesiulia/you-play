import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from pydantic import BaseModel
import psycopg2
from psycopg2 import OperationalError, sql

load_dotenv()

app = FastAPI()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

## Utils

class User(BaseModel):
    username: str
    password: str

def response(success: bool, message: str, status_code: int = 200, data: dict = None):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": success,
            "message": message,
            "data": data or {}
        }
    )

def get_db_connection():
    attempts = 0
    while attempts < 10:
        try:
            conn = psycopg2.connect(
                dbname=os.getenv("POSTGRES_DB"),
                user=os.getenv("POSTGRES_USER"),
                password=os.getenv("POSTGRES_PASSWORD"),
                host="auth-db",
                port=os.getenv("POSTGRES_PORT")
            )
            return conn
        except OperationalError as e:
            print(f"Attempt {attempts + 1}: Retrying...")
            time.sleep(1)
            attempts = attempts + 1
    
    return None

def initialize_db():
    conn = get_db_connection()

    if conn is None:
        print("Failed to connect to database")
        return
    
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
    """)

    conn.commit()
    cur.close()
    conn.close()

### API endpoints

@app.on_event("startup")
async def startup():
    initialize_db()

@app.post("/register")
async def register(user: User):
    conn = get_db_connection()
    if conn is None:
        return response(False, "Failed to connect to database", 500)

    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username=%s", (user.username,))
    existing_user = cur.fetchone()

    if existing_user:
        cur.close()
        conn.close()
        return response(False, "Username already exists", 400)

    try:
        cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (user.username, user.password))
        conn.commit()
    except Exception as e:
        cur.close()
        conn.close()
        return response(False, f"Database error: {str(e)}", 500)

    cur.close()
    conn.close()
    return response(True, f"User {user.username} registered successfully")

@app.post("/login")
async def login(user: User):
    conn = get_db_connection()
    if conn is None:
        return response(False, "Failed to connect to database", 500)

    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username=%s", (user.username,))
    result = cur.fetchone()

    if not result:
        cur.close()
        conn.close()
        return response(False, "Username not found", 404)

    if result[2] != user.password:
        cur.close()
        conn.close()
        return response(False, "Invalid credentials", 400)

    token = generate_jwt(user.username)
    cur.close()
    conn.close()
    return response(True, "Login successful", data={"token": token})

def generate_jwt(username: str):
    return jwt.encode({"sub": username}, SECRET_KEY, algorithm=ALGORITHM)
