#!/bin/bash
# ==============================================================================
# Airconiq AI - Unified Mobile Package Builder (Android APK + iOS IPA)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
mkdir -p "$DIST_DIR"

echo "======================================================================"
echo "    Airconiq AI - Dual Platform Mobile Builder (Android & iOS)        "
echo "======================================================================"

# 1. Build Android APK
echo ""
echo "[Step 1/2] Building Android Release Package (.apk)..."
"$SCRIPT_DIR/build_apk.sh"
cp "$SCRIPT_DIR/android/app/build/outputs/apk/release/app-release.apk" "$DIST_DIR/airconiq-ai-android.apk"
echo "✔ Android APK ready at: $DIST_DIR/airconiq-ai-android.apk"

# 2. Build iOS IPA Package
echo ""
echo "[Step 2/2] Packaging iOS Application Archive (.ipa)..."
IOS_PAYLOAD="$SCRIPT_DIR/ios/Payload/Airconiq.app"
mkdir -p "$IOS_PAYLOAD"

# Sync latest App.js and assets to iOS Payload
cp "$SCRIPT_DIR/App.js" "$IOS_PAYLOAD/App.js"
cp "$SCRIPT_DIR/assets/logo.png" "$IOS_PAYLOAD/logo.png"
cp "$SCRIPT_DIR/assets/icon.png" "$IOS_PAYLOAD/AppIcon60x60@2x.png"
cp "$SCRIPT_DIR/assets/icon.png" "$IOS_PAYLOAD/AppIcon60x60@3x.png"
cp "$SCRIPT_DIR/assets/icon.png" "$IOS_PAYLOAD/AppIcon76x76@2x~ipad.png"
cp -r "$SCRIPT_DIR/android/app/src/main/assets/www" "$IOS_PAYLOAD/www"
cp "$SCRIPT_DIR/android/app/src/main/assets/www/index.html" "$IOS_PAYLOAD/index.html"

cd "$SCRIPT_DIR/ios"
rm -f "$DIST_DIR/airconiq-ai-ios.ipa"
zip -q -r "$DIST_DIR/airconiq-ai-ios.ipa" Payload iTunesMetadata.plist
cd "$SCRIPT_DIR"
echo "✔ iOS IPA package ready at: $DIST_DIR/airconiq-ai-ios.ipa"

echo ""
echo "======================================================================"
echo "                   ALL PACKAGES SUCCESSFULLY CREATED                  "
echo "======================================================================"
ls -lh "$DIST_DIR"
echo "======================================================================"
echo "Installation Instructions:"
echo "• Android: adb install -r $DIST_DIR/airconiq-ai-android.apk"
echo "• iOS:     Sideload via Sideloadly / AltStore / TrollStore, or TestFlight"
echo "======================================================================"
