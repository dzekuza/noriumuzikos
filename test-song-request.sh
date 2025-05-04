#!/bin/bash

# Test adding a song request directly to the API
curl -X POST http://localhost:5000/api/events/1/song-requests \
  -H "Content-Type: application/json" \
  -d '{
    "songName": "Test Song",
    "artistName": "Test Artist",
    "requesterName": "API Test",
    "status": "pending",
    "requestTime": "'"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"'"
  }'

echo -e "\n\nChecking if song request was added:"
curl http://localhost:5000/api/events/1/song-requests

chmod +x test-song-request.sh
./test-song-request.sh
