# UyMap Backend

FastAPI + PostgreSQL backend for the UyMap.uz MVP.

## Local Docker Run

From the project root:

```bash
docker compose up --build
```

The API will be available at:

```text
http://localhost:8000/api
```

Swagger docs:

```text
http://localhost:8000/docs
```

Seed users:

```text
Admin: admin@uymap.uz / admin12345
Owner: owner@uymap.uz / owner12345
```

## Frontend Env

The frontend defaults to `http://localhost:8000/api`. To override it, create a Vite env file:

```bash
VITE_API_URL=http://localhost:8000/api
```
