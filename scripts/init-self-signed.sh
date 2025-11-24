#!/bin/bash

if ! docker compose version > /dev/null 2>&1; then
  echo 'Error: docker compose is not installed.' >&2
  exit 1
fi

domains=($DOMAIN_NAME)
rsa_key_size=4096
data_path="./data/certbot"

echo "### Creating self-signed certificate for $domains ..."
path="/etc/letsencrypt/live/$domains"
mkdir -p "$data_path/conf/live/$domains"
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 365\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=$domains'" certbot
echo

echo "### Starting nginx ..."
docker compose -f docker-compose.prod.yml up -d nginx
