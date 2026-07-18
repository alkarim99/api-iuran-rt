#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "📦 Pulling backend..."
git pull

cd ../iuran-rt-apps
echo "📦 Pulling frontend..."
git pull

cd ../api-iuran-rt

echo "🔨 Rebuilding & restarting..."
docker compose up -d --build

echo "✅ Update selesai!"
