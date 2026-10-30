#!/bin/sh
# Builds the Firefox / Zen Browser package from the shared extension sources.
set -eu

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/dist/firefox"

rm -rf "$out"
mkdir -p "$out"
cp "$root/firefox/manifest.json" "$root/content.js" "$root/styles.css" "$out/"

rm -f "$root/dist/caprover-redeploy-firefox.zip"
(cd "$out" && zip -qr "$root/dist/caprover-redeploy-firefox.zip" .)

echo "Unpacked: $out"
echo "Package:  $root/dist/caprover-redeploy-firefox.zip"
