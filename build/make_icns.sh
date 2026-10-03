#!/usr/bin/env bash
# Build build/icon.icns from build/icon.png using sips and iconutil.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PNG="${HERE}/icon.png"
ICONSET="${HERE}/icon.iconset"
ICNS="${HERE}/icon.icns"

[[ -f "$PNG" ]] || { echo "missing ${PNG}" >&2; exit 1; }

rm -rf "$ICONSET"
mkdir -p "$ICONSET"

render() {
  local name=$1
  local px=$2
  sips -z "$px" "$px" "$PNG" --out "${ICONSET}/${name}.png" >/dev/null
}

render icon_16x16 16
render 'icon_16x16@2x' 32
render icon_32x32 32
render 'icon_32x32@2x' 64
render icon_128x128 128
render 'icon_128x128@2x' 256
render icon_256x256 256
render 'icon_256x256@2x' 512
render icon_512x512 512
render 'icon_512x512@2x' 1024

# iconutil reads only from the boot volume; copy the iconset to a temp dir first.
tmp="$(mktemp -d)"
cp -R "$ICONSET" "${tmp}/icon.iconset"
xattr -cr "${tmp}/icon.iconset" 2>/dev/null || true
iconutil -c icns "${tmp}/icon.iconset" -o "${tmp}/icon.icns"
cp "${tmp}/icon.icns" "$ICNS"
rm -rf "$ICONSET" "$tmp"
echo "wrote ${ICNS}"
