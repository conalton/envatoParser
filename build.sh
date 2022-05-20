#!/bin/bash
docker-compose build &&
docker-compose run nextjs_front bash -c "npm i&&npm run build" &&
docker-compose run parser bash -c "npm i"