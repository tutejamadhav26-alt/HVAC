# Airconiq AI - Mobile App Distribution Packages

This directory contains standalone release builds of the **Airconiq AI** mobile diagnostics and telemetry application for both **Android** and **iOS**:

```
mobile/dist/
├── airconiq-ai-android.apk     (Android Application Package - 422 KB)
└── airconiq-ai-ios.ipa         (iOS Application Archive - 245 KB)
```

---

## 📱 Android Installation Guide (`.apk`)

### Option 1: Direct Transfer / Phone Install
1. Transfer `airconiq-ai-android.apk` to your phone via USB, Google Drive, WhatsApp, or email.
2. Tap the file in your phone's File Manager / Downloads.
3. If prompted, toggle **"Allow from this source"** (Unknown Sources / Install Unknown Apps).
4. Tap **Install** and open **Airconiq AI**.

### Option 2: Via ADB (Android Debug Bridge)
Connect your phone with USB Debugging enabled or start an Android emulator:
```bash
adb install -r mobile/dist/airconiq-ai-android.apk
```

---

## 🍏 iOS Installation Guide (`.ipa`)

*Note: In the Apple ecosystem, `.ipa` is the iOS counterpart to Android's `.apk`.*

### Option 1: Sideloadly (Recommended for Windows / Mac / Linux)
1. Download [Sideloadly](https://sideloadly.io/) on your PC.
2. Connect your iPhone via USB.
3. Drag & drop `airconiq-ai-ios.ipa` into Sideloadly.
4. Enter your Apple ID to sign the app for free.
5. Tap **Start**. The app will appear on your iPhone home screen.
6. On iPhone: Go to **Settings > General > VPN & Device Management**, tap your Apple ID, and tap **"Trust"**.

### Option 2: AltStore / TrollStore
- Open **AltStore** on your iPhone.
- Tap **"+"** in My Apps and select `airconiq-ai-ios.ipa`.

### Option 3: Instant 1-Tap Safari Web App (PWA)
If you do not wish to sideload certificates:
1. Open the Airconiq web portal in Safari on your iPhone (`http://<your-server-ip>:5173`).
2. Tap the **Share** button (box with upward arrow).
3. Tap **"Add to Home Screen"**.
4. The Airconiq app icon and full-screen native mobile experience will be installed instantly.

---

## 🔄 Rebuilding Packages
To recompile both platforms at any time:
```bash
./mobile/build_mobile_packages.sh
```
