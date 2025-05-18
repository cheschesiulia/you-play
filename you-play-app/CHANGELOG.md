# Changelog

## [Unreleased]

- Frontend.
- Functionality to create playlists and add songs to them.
- Recommendations system based on user's history and liked songs.
- Kong.
- CI/CD.
- Tests.

## Andrei Anghelescu 2025-04-27

### Added
- Playlist service that allows users to like and unlike songs.
- History functionality to track the songs a user has listened to.
- PostgreSQL playlists database with persistent storage.

## Andrei Anghelescu 2025-04-24

### Added
- MINIO-based storage solution hosted on my personal Raspberry Pi, used with a public IP address.
- Minimal streaming service that allows users to stream songs based on their subscription plan.
- Secure access using JWT token validation.
- Serving mp3 files and cover images.

## Iulia Chesches 2025-04-18

### Added
- Adminer service for database management.
- Subscription plan field in the User model.

### Changed
- Token payload now includes the user's subscription plan.

## Iulia Chesches 2025-04-17

### Added
- Docker compose setup.
- FastAPI authentication service with registration and login endpoints.
- JWT token generation.
- PostgreSQL database for user data with persistent storage.
- Environment-based configuration using .env variables.