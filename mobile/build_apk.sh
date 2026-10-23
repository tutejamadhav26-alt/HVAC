#!/bin/bash
# ==============================================================================
# Airconiq AI - Mobile APK Automated Builder
# Packages Native Android APK with classes.dex, compiled resources & v1/v2 signatures
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/android/app/build/outputs/apk/release"
mkdir -p "$OUTPUT_DIR"

echo "============================================================"
echo "    Building Airconiq AI Android Release Package (APK)      "
echo "============================================================"

# Environment & Toolchain Paths
export JAVA_HOME="/home/piet/.local/opt/jdk-17.0.12+7"
export PATH="$JAVA_HOME/bin:$PATH"

TOOLS_DIR="/home/piet/.local/opt/android-tools"
export LD_LIBRARY_PATH="$TOOLS_DIR/usr/lib/aarch64-linux-gnu/android:$TOOLS_DIR/usr/lib/aarch64-linux-gnu:$TOOLS_DIR/usr/lib:$LD_LIBRARY_PATH"

AAPT="$TOOLS_DIR/usr/bin/aapt"
DX="$TOOLS_DIR/usr/lib/android-sdk/build-tools/debian/dx"
ZIPALIGN="$TOOLS_DIR/usr/bin/zipalign"
APKSIGNER_JAR="$TOOLS_DIR/usr/lib/android-sdk/build-tools/debian/apksigner.jar"
ANDROID_JAR="/home/piet/.local/opt/android-sdk/platforms/android-30/android.jar"
KEYSTORE="$SCRIPT_DIR/android/app/debug.keystore"

echo "[1/6] Validating Android SDK toolchain..."
if [ ! -f "$AAPT" ] || [ ! -f "$ANDROID_JAR" ] || [ ! -f "$DX" ]; then
    echo "[-] Android build tools not fully found. Re-checking..."
    exit 1
fi
echo "      ✔ AAPT: $($AAPT version)"
echo "      ✔ DX: $($DX --version)"
echo "      ✔ OpenJDK: $($JAVA_HOME/bin/java -version 2>&1 | head -n 1)"

TEMP_BUILD=$(mktemp -d)
trap 'rm -rf "$TEMP_BUILD"' EXIT

GEN_DIR="$TEMP_BUILD/gen"
CLASSES_DIR="$TEMP_BUILD/classes"
DEX_DIR="$TEMP_BUILD/dex"
mkdir -p "$GEN_DIR" "$CLASSES_DIR" "$DEX_DIR"

echo "[2/6] Compiling Android resources & generating R.java..."
$AAPT package -m -J "$GEN_DIR" \
    -M "$SCRIPT_DIR/android/app/src/main/AndroidManifest.xml" \
    -S "$SCRIPT_DIR/android/app/src/main/res" \
    -I "$ANDROID_JAR"

echo "[3/6] Compiling Java source files with OpenJDK 17..."
javac -source 8 -target 8 -cp "$ANDROID_JAR" -d "$CLASSES_DIR" \
    "$GEN_DIR/com/smarthvac/ai/R.java" \
    "$SCRIPT_DIR/android/app/src/main/java/com/smarthvac/ai/MainActivity.java"

echo "[4/6] Translating bytecode into Dalvik Executable (classes.dex)..."
$DX --dex --min-sdk-version=26 --output="$DEX_DIR/classes.dex" "$CLASSES_DIR"

echo "[5/6] Packaging APK and embedding resources & bytecode..."
UNALIGNED_APK="$TEMP_BUILD/unaligned.apk"
ALIGNED_APK="$TEMP_BUILD/aligned.apk"
FINAL_APK="$OUTPUT_DIR/app-release.apk"

$AAPT package -f \
    -M "$SCRIPT_DIR/android/app/src/main/AndroidManifest.xml" \
    -S "$SCRIPT_DIR/android/app/src/main/res" \
    -A "$SCRIPT_DIR/android/app/src/main/assets" \
    -I "$ANDROID_JAR" \
    -F "$UNALIGNED_APK"

cd "$DEX_DIR"
$AAPT add "$UNALIGNED_APK" classes.dex
cd "$SCRIPT_DIR"

echo "[6/6] Aligning and signing APK (v1, v2, v3 schemes)..."
$ZIPALIGN -f -p 4 "$UNALIGNED_APK" "$ALIGNED_APK"

java -jar "$APKSIGNER_JAR" sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:android \
    --ks-key-alias androiddebugkey \
    --key-pass pass:android \
    --out "$FINAL_APK" \
    "$ALIGNED_APK"

echo "============================================================"
echo "✔ Verification Output:"
java -jar "$APKSIGNER_JAR" verify --verbose "$FINAL_APK"
echo "============================================================"
echo "[+] SUCCESS: APK successfully generated at:"
echo "    $FINAL_APK"
ls -lh "$FINAL_APK"
echo "============================================================"
echo "Ready for installation on any Android device via:"
echo "    adb install -r $FINAL_APK"
echo "============================================================"
