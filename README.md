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

## Usage

Install the CLI with `npm i -g selflare` and run the following commands in the directory of your worker:

```bash
selflare compile   # Compile the worker to Cap'n Proto
selflare docker    # Generate Dockerfile and docker-compose.yml
docker compose up  # Run the worker
```

The image is based on [`jacoblincool/workerd`](https://github.com/JacobLinCool/workerd-docker) which has a size of 35MB (compressed) and supports both `amd64` and `arm64` architectures.
