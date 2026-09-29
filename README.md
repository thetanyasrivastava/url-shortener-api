# URL Shortener API

A REST API for creating short links, redirecting visitors, supporting custom aliases and expiration dates, and tracking clicks. Built with Express, Prisma, PostgreSQL, and Redis.

## Requirements

- Node.js 20 or newer
- Docker Desktop (recommended), or local PostgreSQL and Redis

## Quick start with Docker

```bash
cp .env.example .env
docker compose up --build
```

The API is available at `http://localhost:3000`; Swagger UI is at `http://localhost:3000/api-docs` and health is at `/health`. Docker Compose starts PostgreSQL and Redis, applies migrations, and starts the API.

## Run locally

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `REDIS_URL`, and `BASE_URL`.
2. Start PostgreSQL and Redis.
3. Install dependencies and create the database schema:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Redis is optional at runtime; when unavailable the API bypasses the cache. PostgreSQL is required. Use `npm start` for a non-watch server and `npm run db:studio` to inspect database records.

## API

### Create a short URL

`POST /api/v1/urls`

```json
{
  "url": "https://www.amazon.in/some/very/long/product/link",
  "alias": "my-product",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}
```

`alias` and `expiresAt` are optional. URLs must use HTTP or HTTPS. Aliases are unique and may contain letters, numbers, hyphens, and underscores (3–64 characters). Expiry must be in the future. Response is `201 Created` with `data.shortUrl`.

### Redirect

Open `GET /:code` (for example, `http://localhost:3000/my-product`). Active codes return a `302` redirect and increment the click count. Unknown codes return `404`; expired codes return `410`.

### List URLs

`GET /api/v1/urls?page=1&limit=20` returns newest first. `limit` is capped at 100.

### Get URL details

`GET /api/v1/urls/:code` returns the original URL, expiry, creation time, short URL, and click count.

### Other endpoints

- `GET /health` — process health check
- `GET /api-docs` — interactive OpenAPI documentation

## Environment variables

See `.env.example`. `BASE_URL` controls the short link host in API responses. Set it to the public HTTPS URL when deploying. Rate limiting is applied per client IP; configure `trust proxy` appropriately for your deployment.

## Design notes

- **MVC/service layers:** Routes map requests to controllers, which delegate persistence and URL resolution to services.
- **Storage:** PostgreSQL persists URLs; Prisma schema indexes creation and expiration timestamps.
- **Cache:** Redis caches code-to-destination lookups for up to one hour (and never beyond expiry). Click increments are written to PostgreSQL on each redirect.
- **Errors:** Validation and operational errors use a consistent `{ "error": { "code", "message" } }` shape.
- **Logging:** Morgan request logs and application events are written to console and `logs/app.log`.
- **Security:** Helmet headers, CORS, bounded JSON body size, input validation, and rate limiting are enabled.

## Project structure

```text
prisma/schema.prisma
src/config/          # Environment, database, Redis
src/controllers/     # HTTP controllers
src/middlewares/     # Validation, errors, 404
src/routes/          # API routes
src/services/        # URL business logic
src/utils/           # Logger, errors, OpenAPI, helpers
src/validators/      # Zod request schemas
logs/
tests/
server.js
Dockerfile
docker-compose.yml
```
