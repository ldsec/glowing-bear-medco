#!/usr/bin/env sh
USER_GROUP="$(id -u):$(id -g)" docker-compose up dev-server
