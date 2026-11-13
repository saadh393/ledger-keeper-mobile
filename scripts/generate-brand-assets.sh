#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
source_svg="$root/assets/brand/ledger-mark.svg"
background='#131314'
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

body="$(sed -e '1d' -e '$d' "$source_svg")"
silhouette="$(printf '%s\n' "$body" | grep -E '^<path d="M(88|256|232) ' | sed -E 's/fill="[^"]+"/fill="#fff"/')"
cutouts="$(printf '%s\n' "$body" | grep -E '^<rect|^<path d="M(320|164) ' | sed -E -e 's/fill="[^"]+"/fill="#000"/' -e 's/ opacity="[^"]+"//')"

mark() {
  local size="$1" offset
  offset=$(((1024 - size) / 2))
  printf '<g transform="translate(%s %s) scale(%s)">%s</g>' "$offset" "$offset" "$(echo "scale=6; $size / 512" | bc)" "$2"
}

canvas() {
  printf '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">%s</svg>' "$1" > "$work/$2.svg"
  sips -s format png "$work/$2.svg" --out "$work/$2.png" > /dev/null
}

canvas "<rect width=\"1024\" height=\"1024\" fill=\"$background\"/>$(mark 720 "$body")" icon
canvas "$(mark 580 "$body")" adaptive-icon
canvas "<defs><mask id=\"m\">$(mark 580 "$silhouette$cutouts")</mask></defs><rect width=\"1024\" height=\"1024\" fill=\"#fff\" mask=\"url(#m)\"/>" monochrome-icon

cp "$work/icon.png" "$root/assets/icon.png"
cp "$work/adaptive-icon.png" "$root/assets/adaptive-icon.png"
cp "$work/adaptive-icon.png" "$root/assets/splash-icon.png"
cp "$work/monochrome-icon.png" "$root/assets/monochrome-icon.png"
sips -Z 512 "$work/icon.png" --out "$root/assets/play-store-icon.png" > /dev/null
sips -Z 48 "$work/icon.png" --out "$root/assets/favicon.png" > /dev/null
