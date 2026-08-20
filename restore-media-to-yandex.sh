#!/bin/bash
set -euo pipefail

YC="/Users/onethree/yandex-cloud/bin/yc"
SOURCE="https://effectport-5rhal3bg.manus.space"
BUCKET="www.effectgraff.ru"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

printf '%s\n' "Получаю список медиа из опубликованного сайта..."
curl -fsSL "$SOURCE/assets/index-DVkTrKa5.js" -o "$WORK/app.js"

grep -oE '/manus-storage/[^" ]+\.(png|jpe?g|webp|gif|mp3|ogg|wav)' "$WORK/app.js" | sort -u > "$WORK/media.txt"

count=0
while IFS= read -r path; do
  [ -z "$path" ] && continue
  mkdir -p "$WORK$(dirname "$path")"
  printf 'Загружаю %s\n' "$path"
  curl -fsSL "$SOURCE$path" -o "$WORK$path"
  "$YC" storage s3 cp "$WORK$path" "s3://$BUCKET$path"
  count=$((count + 1))
done < "$WORK/media.txt"

printf '\nГотово: перенесено медиафайлов: %s\n' "$count"
printf '%s\n' 'Теперь обновите страницу сайта через Command + Option + R.'
