#!/usr/bin/env bash
# Build a macOS DMG. Signing identity and notary profile come from the environment.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "${ROOT}/build/icon.icns" ]]; then
  bash "${ROOT}/build/make_icns.sh"
fi

IDENTITY="${CSC_NAME:-${SIGN_IDENTITY:-}}"
if [[ -n "${NOTARY_PROFILE:-}" && -z "${APPLE_KEYCHAIN_PROFILE:-}" ]]; then
  export APPLE_KEYCHAIN_PROFILE="${NOTARY_PROFILE}"
fi

sign_apps_adhoc() {
  local app
  while IFS= read -r app; do
    [[ -n "$app" ]] || continue
    codesign --force --deep --sign - --options runtime \
      --entitlements "${ROOT}/build/entitlements.mac.plist" \
      "$app"
  done < <(find "${ROOT}/dist-installer" -name '*.app' -maxdepth 3 2>/dev/null)
}

prepackaged_dir() {
  local d
  for d in \
    "${ROOT}/dist-installer/mac-universal" \
    "${ROOT}/dist-installer/mac-arm64" \
    "${ROOT}/dist-installer/mac-x64" \
    "${ROOT}/dist-installer/mac"; do
    if [[ -d "$d" ]]; then
      printf '%s\n' "$d"
      return 0
    fi
  done
  return 1
}

if [[ -n "$IDENTITY" ]]; then
  export CSC_NAME="$IDENTITY"
  npx electron-builder --mac dmg --universal --publish never -c.mac.identity="$IDENTITY"
else
  export CSC_IDENTITY_AUTO_DISCOVERY=false
  # electron-builder looks up "-" in the keychain, so ad-hoc signing is codesign -s -.
  npx electron-builder --mac dir --universal --publish never
  sign_apps_adhoc
  pre="$(prepackaged_dir)"
  if ! npx electron-builder --mac dmg --publish never --prepackaged "$pre"; then
    ver="$(node -p 'require("./package.json").version')"
    arch_label="universal"
    case "$pre" in
      *-arm64) arch_label="arm64" ;;
      *-x64) arch_label="x64" ;;
    esac
    out="${ROOT}/dist-installer/ShadowProtocol-${ver}-${arch_label}.dmg"
    hdiutil create -ov -volname "Shadow Protocol" -srcfolder "$pre" -format UDZO "$out"
  fi
fi
