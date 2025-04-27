import requests
import time
import json
import os

BASE_URL = "http://localhost:8000/playlist"

def cleanup_database():
    print("\nCleaning database for new tests...")
    response = requests.post(f"{BASE_URL}/test/cleanup")
    assert response.status_code == 200
    print("Database has been cleaned!")
    print("-" * 50)

def test_playlist_flow():
    # Clean database before test
    cleanup_database()
    
    # 1. Add songs to history for user 'alex'
    print("\n1. Adding songs to history for user 'alex'...")
    
    response = requests.post(
        f"{BASE_URL}/listening-history",
        json={"username": "alex", "song_title": "Shape of You"},
        headers={"Content-Type": "application/json"}
    )
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    
    time.sleep(2)
    
    response = requests.post(
        f"{BASE_URL}/listening-history",
        json={"username": "alex", "song_title": "Bohemian Rhapsody"},
        headers={"Content-Type": "application/json"}
    )
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    
    time.sleep(2)
    
    response = requests.post(
        f"{BASE_URL}/listening-history",
        json={"username": "alex", "song_title": "Hotel California"},
        headers={"Content-Type": "application/json"}
    )
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200

    # 2. Check listening history
    print("\n2. Checking listening history for 'alex'...")
    response = requests.get(f"{BASE_URL}/listening-history/alex")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    history = response.json()
    assert len(history) == 3

    # 3. Add songs to favorites
    print("\n3. Adding songs to favorites...")
    response = requests.post(f"{BASE_URL}/like-song/alex/Shape%20of%20You")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200

    response = requests.post(f"{BASE_URL}/like-song/alex/Hotel%20California")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200

    # 4. Check favorites list
    print("\n4. Checking favorites list...")
    response = requests.get(f"{BASE_URL}/liked-songs/alex")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    liked_songs = response.json()
    assert len(liked_songs) == 2

    # 5. Remove a song from favorites
    print("\n5. Removing 'Shape of You' from favorites...")
    response = requests.delete(f"{BASE_URL}/unlike-song/alex/Shape%20of%20You")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200

    # 6. Check updated favorites list
    print("\n6. Checking updated favorites list...")
    response = requests.get(f"{BASE_URL}/liked-songs/alex")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    liked_songs = response.json()
    assert len(liked_songs) == 1

    # 7. Try to add a song that's already in favorites
    print("\n7. Trying to add 'Hotel California' to favorites again...")
    response = requests.post(f"{BASE_URL}/like-song/alex/Hotel%20California")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    assert response.json()["message"] == "Song already in liked songs"

    # 8. Simulate a second user to test data isolation
    print("\n8. Adding songs for a second user 'maria'...")
    response = requests.post(
        f"{BASE_URL}/listening-history",
        json={"username": "maria", "song_title": "Dancing Queen"},
        headers={"Content-Type": "application/json"}
    )
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200

    response = requests.post(f"{BASE_URL}/like-song/maria/Dancing%20Queen")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200

    # 9. Verify data isolation between users
    print("\n9. Checking maria's playlist...")
    response = requests.get(f"{BASE_URL}/liked-songs/maria")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    maria_songs = response.json()
    assert len(maria_songs) == 1
    assert maria_songs[0]["title"] == "Dancing Queen"

    print("\nVerifying alex's playlist remained unchanged...")
    response = requests.get(f"{BASE_URL}/liked-songs/alex")
    print(json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    alex_songs = response.json()
    assert len(alex_songs) == 1
    assert alex_songs[0]["title"] == "Hotel California" 