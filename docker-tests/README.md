# Testing in container

Docker environment where backend tests can be executed against a PostgreSQL instance running in a container.

## Usage

Define a PostgreSQL password in the environment variable POSTGRES_PASSWORD, for example:
```
$ export POSTGRES_PASSWORD="password"
```
Execute Docker Compose:
```
$ docker-compose up --abort-on-container-exit --exit-code-from back-end-test
```
