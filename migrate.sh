#!/usr/bin/env bash
docker run -v "$(pwd)"/schema:/schema:ro schemify schemify \
       -H host.docker.internal \
       -p 5432 \
       -U delta -P delta -d delta \
       -s /schema 

