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
- Created a playlist service. It allows the user to like and unlike songs.
- It also allows the user to see the history of the songs they have listened to.

## Andrei Anghelescu 2025-04-24

### Added
- Created a MINIO data based on my personal raspberry pi, we'll use it with a public ip address for storing the songs.
- Created a minimal streaming service. It checks the user's plan and allows them to stream songs with a time limit.
- Streaming service provides the mp3 and the cover image.

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