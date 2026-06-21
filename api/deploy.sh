#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running migrations and seeds..."
php artisan migrate --seed --force

echo "Clearing optimization cache..."
php artisan optimize:clear

echo "Clearing Lighthouse GraphQL cache..."
php artisan lighthouse:cache-clear

echo "Clearing general application cache..."
php artisan cache:clear

echo "Deployment tasks completed successfully!"
