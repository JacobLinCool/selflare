# Selflare

Compile Cloudflare Workers to Cap'n Proto and deliver them as minimalist Docker images.

## Features

-   [x] Cloudflare Worker
-   [x] Cloudflare KV
-   [x] Cloudflare D1
-   [x] Cloudflare R2
-   [x] Cloudflare DO
-   [x] Cache API
-   [ ] Cloudflare Vectorize
-   [x] Environment Variables

## Usage

Install the CLI with `npm i -g selflare` and run the following commands in the directory of your worker:

```bash
selflare compile   # Compile the worker to Cap'n Proto
selflare docker    # Generate Dockerfile and docker-compose.yml
docker compose up  # Run the worker
```

## Environment Variables

All the environment variables defined in `[vars]` section of the `wrangler.toml` file will be replaced by the corresponding environment variables in the Docker container.

You can simply set the environment variables in the `docker-compose.yml` file like this:

```yaml
version: "3.8"

services:
    worker:
        build: .
        image: worker
        volumes:
            - ./.storage/cache:/worker/cache
            - ./.storage/kv:/worker/kv
            - ./.storage/d1:/worker/d1
            - ./.storage/r2:/worker/r2
        ports:
            - "8080:8080"
        environment:
            - SOME_TOKEN=I_AM_A_TOKEN
```

The image is based on [`jacoblincool/workerd`](https://github.com/JacobLinCool/workerd-docker) which has a size of 35MB (compressed) and supports both `amd64` and `arm64` architectures.
