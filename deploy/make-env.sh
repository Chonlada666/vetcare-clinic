#!/bin/sh
# สร้างไฟล์ .env สำหรับ production บน VPS
# วิธีใช้: sh make-env.sh ghcr.io/<username>/<repo>
set -e

if [ -z "$1" ]; then
  echo "วิธีใช้: sh make-env.sh ghcr.io/<username>/<repo>"
  exit 1
fi

if [ -f .env ]; then
  echo "มีไฟล์ .env อยู่แล้ว — ไม่เขียนทับ (ถ้าต้องการสร้างใหม่ ให้ลบ .env ก่อน)"
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
echo "สร้าง .env แล้ว (image: $IMAGE)"
