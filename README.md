# Social Network Backend

## How to run
1. Clone this repo
2. Install dependencies: `pnpm install`
3. Start services with docker compose: `docker-compose up -d`
4. Migrate db with Prisma:
   ```
   export DATABASE_URL="mysql://root:app_secret@localhost:3306/social_network?connection_limit=100"
   pnpx prisma migrate dev
   pnpx prisma generate
   ```
5. Start server: `pnpm dev`

## Docker compse
```
docker-compose up -d
```

## Migrate db with Prisma
```
export DATABASE_URL="mysql://root:app_secret@localhost:3306/social_network?connection_limit=100"
pnpx prisma migrate dev
pnpx prisma generate
```