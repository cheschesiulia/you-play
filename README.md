# YouPlay - Anghelescu Andrei, Chesches Iulia, 343C1 

## Notes

# 1. Create a Docker network for Swarm nodes
docker network create swarm-net

# 2. Start manager and 2 workers (all Docker-in-Docker)
```
docker run -dit --name manager --hostname manager --network swarm-net --privileged \
 -p 3000:3000 -p 3100:3100 -p 9000:9000 -p 9443:9443 -p 8000:8000 -p 8080:8080 -p 3001:3001 docker:dind 
  ```

```
docker run -dit --name worker1 --hostname worker1 --network swarm-net --privileged docker:dind 
```

```
docker run -dit --name worker2 --hostname worker2 --network swarm-net --privileged docker:dind
```

# 3. Initialize Swarm on manager node
```
docker exec -it manager sh -c "docker swarm init --advertise-addr manager"
```

# 4. Join workers to the Swarm (copy the join command from the output above)
```
docker exec -it worker1 sh -c "docker swarm join --token <TOKEN> manager:2377"
docker exec -it worker2 sh -c "docker swarm join --token <TOKEN> manager:2377"
```

# 5. (On manager) Clone repo and deploy stack
```
docker exec -it manager sh
apk add --no-cache git
git clone https://github.com/cheschesiulia/you-play.git
cd you-play/you-play-app
docker stack deploy -c docker-compose.yml youplay
```

## Services

### Auth Service
- Provides user authentication and token generation.

### Playlist Service
- Manages user playlists and their history.

### Streaming Service
- Handles music streaming (audio files, access control).

### Databases
- Each core service has its own PostgreSQL database for isolation.
- Adminer is available for manual DB inspection.

### Portainer
- Management UI for Docker Swarm services: https://localhost:9000

### Grafana (Monitoring/Observability)
- Available at: http://localhost:3001
- Preconfigured dashboards for DB statistics and user activity.

### Kong
- API Gateway for routing requests to microservices: http://localhost:8000

---

## Evaluation Checklist (Barem)
- [x] Minimum 3 custom microservices (Auth, Playlists, Streaming)
- [x] At least one dedicated database service (PostgreSQL)
- [x] Database UI (Adminer)
- [x] Portainer (Swarm management UI)
- [x] Docker Swarm deployment, multi-node cluster
- [x] API Gateway (Kong)
- [x] Monitoring/observability (Grafana dashboards)
- [x] Can be extended with GitLab CI/CD or Kubernetes as bonus

---

## Notes
- Default credentials for Grafana and Portainer are `admin` / `admin` (change after first login!)
- For troubleshooting, use:
  - `docker service ls` (on manager) to see service status
  - `docker service logs <SERVICE>` to see logs for a specific service
  - `docker exec -it <container> sh` to get a shell in any running container
- All configuration files and provisioning are inside the repo.
