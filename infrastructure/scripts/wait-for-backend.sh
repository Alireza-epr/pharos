#!/bin/sh
# wait-for-backend.sh

BACKEND_URL=${BACKEND_URL:-http://backend:1370/health}

echo "Checking backend once before starting frontend..."

# Try once
if curl -fs $BACKEND_URL > /dev/null; then
  echo "Backend is up!"
else
  echo "Backend is not responding, exiting."
  exit 1
fi

# Start Nginx
exec nginx -g "daemon off;"