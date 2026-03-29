#!/bin/bash

# PRODUCTION
echo "🚀 Starting production deployment..."

# Reset & pull latest code
git reset --hard
git checkout main
git pull origin main

npm i
npm run build
pm2 start process.config.js --env production
pm2 save

echo "✅ Production deployment complete!"




# # DEVELOPMENT
# echo "🧪 Starting development deployment..."

# git reset --hard
# git checkout develop
# git pull origin develop

# npm i

# pm2 delete all
# pm2 start "npm run start:dev" --name COMFYZONE

# pm2 save

# echo "✅ Development deployment complete!"