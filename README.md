# Microservices and Kubernetes: Lab 2 - Docker Compose and deployment

In Lab 2 you will deploy a Docker Compose service in a live environment. For the purposes of this lab, for the duration of the lab on Friday you will be given a Hetzner environment where you can experiment with this setup.

You have two choices:
- In case you've finished [Lab 1](https://github.com/darktohka/kubernetes-lab-02-docker), you can choose to extend your Docker container with a docker-compose.yaml environment:
  1. First, create the corresponding docker-compose.yaml environment that will start your Docker container, as if you were starting it with a simple Docker command.
  2. You can test with `docker compose up -d`, or shut down your environment with `docker compose down`.
  3. Add an external database to your code that persists data over the previous in-memory storage mechanism.
  4. Create two new networks: one for your backend and one for your database. Connect your backend to both networks, but connect the database only to the database network.
  5. Add the new database to the docker-compose, and have the application connect to it through its **container name**.
- You can also choose to install any self-hosted application that is packaged using a Dockerfile. For example, try [Immich](https://docs.immich.app/install/docker-compose), an awesome Google Photos alternative.

Try to deploy the application in the live environment!

If possible, set up Caddy as your web server.

Fork this repository and continue your work here.

## Implementation

This repository implements the first option using Express, PostgreSQL, Docker
Compose, and Caddy.

Start the stack:

```sh
docker compose up -d --build
```

Caddy exposes the application on `http://localhost`. The Express container is
reachable only on the `backend` network; PostgreSQL is reachable only on the
internal `database` network. The Express service joins both networks and uses
the database container name, `database`, as `DB_HOST`.

Try the persistent API:

```sh
curl http://localhost/health
curl -X POST http://localhost/notes \\
  -H 'content-type: application/json' \\
  -d '{"text":"My first persistent note"}'
curl http://localhost/
```

The `postgres_data` named volume retains notes across `docker compose down` and
subsequent `docker compose up -d` runs. Use the following only when you also
want to delete the stored data:

```sh
docker compose down -v
```
