#!/bin/sh
set -e

echo "🚀 Starting backend initialization..."

echo "⏳ Waiting for database to be ready..."
# Wait for postgres to be ready
until node -e "const { Client } = require('pg'); const client = new Client(process.env.DATABASE_URL); client.connect().then(() => { console.log('Database connected'); client.end(); }).catch(() => process.exit(1));" 2>/dev/null; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run seed

echo "✅ Backend initialization complete!"
echo "🚀 Starting development server..."

# Execute the CMD from Dockerfile
exec "$@"
