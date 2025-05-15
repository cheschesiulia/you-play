# YouPlay - Anghelescu Andrei, Chesches Iulia, 343C1 

## Notes

1. Deploy with Play With Docker:
    - Go to https://labs.play-with-docker.com/
    - Click on "Start a new session"
    - Create 3 instances
    - Make one of them a manager and the other two workers:
        - `docker swarm init --advertise-addr <MANAGER_IP>`
        - `docker swarm join --token <WORKER_TOKEN> <MANAGER_IP>:2377` (this command will be shown in the terminal of the manager, just copy paste it in the terminal of the workers)
    - On the manager, clone the repository:
        - `git clone https://github.com/cheschesiulia/you-play.git`
        - And deploy stack
        - `docker stack deploy -c docker-compose.yml youplay`
    - In the UI it will show all exposed ports, click on 8000 (kong), which will redirect you to frontend

2. Place any other services in the docker-compose.yml file, and push their images to Github registry by modifying the yml file under .github/workflows and pushing the changes to the main branch.

## Services

### Auth

### Playlists

### Streaming