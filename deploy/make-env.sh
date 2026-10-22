#!/bin/sh
# à¸ªà¸£à¹‰à¸²à¸‡à¹„à¸Ÿà¸¥à¹Œ .env à¸ªà¸³à¸«à¸£à¸±à¸š production à¸šà¸™ VPS
# à¸§à¸´à¸˜à¸µà¹ƒà¸Šà¹‰: sh make-env.sh ghcr.io/<username>/<repo>
set -e

if [ -z "$1" ]; then
  echo "à¸§à¸´à¸˜à¸µà¹ƒà¸Šà¹‰: sh make-env.sh ghcr.io/<username>/<repo>"
  exit 1
fi

if [ -f .env ]; then
  echo "à¸¡à¸µà¹„à¸Ÿà¸¥à¹Œ .env à¸­à¸¢à¸¹à¹ˆà¹à¸¥à¹‰à¸§ â€” à¹„à¸¡à¹ˆà¹€à¸‚à¸µà¸¢à¸™à¸—à¸±à¸š (à¸–à¹‰à¸²à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸ªà¸£à¹‰à¸²à¸‡à¹ƒà¸«à¸¡à¹ˆ à¹ƒà¸«à¹‰à¸¥à¸š .env à¸à¹ˆà¸­à¸™)"
  exit 1
fi

IMAGE=$(echo "$1" | tr '[:upper:]' '[:lower:]')

cat > .env <<EOF
APP_PORT=127.0.0.1:3300
APP_IMAGE=$IMAGE:latest
SLIPOK_API_KEY=SLIPOKFA1GXI2
SLIPOK_BRANCH_ID=77947
EOF

chmod 600 .env
echo "à¸ªà¸£à¹‰à¸²à¸‡ .env à¹à¸¥à¹‰à¸§ (image: $IMAGE)"
