# QR Flare

A lean, premium MVP for generating beautiful QR codes. Built with React Native + Expo (SDK 51).

## Features

- Generate QR codes for URL, Text, Email, Phone, and Wi-Fi
- Free download as PNG
- Premium mode (mock unlock, local state):
  - Upload center logo
  - 5 built-in templates: Clean Frame, Instagram, Business Card, Scan Me poster, Wi-Fi
  - Custom foreground & background colors
  - Download premium QR

Dark theme with bold electric-blue / purple / pink / teal flare accents.

## Install & Run

Requires Node 18+ and the Expo Go app on your phone (or an iOS/Android simulator).

```bash
cd qr-flare
npm install
npx expo start
```

Then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Or scan the QR code with Expo Go on your device

If you hit peer-dep issues:
```bash
npm install --legacy-peer-deps
```

To ensure native packages match Expo SDK versions:
```bash
npx expo install
```

## How to test Premium

Premium is a local in-memory mock. Two ways to toggle:

1. **Flow:** Home → **Unlock Branding** → **Unlock Premium — $4.99**. Fake purchase, flips the flag.
2. **Dev switch:** Upgrade screen has a dashed-border "Dev: Premium Mode" switch at the bottom for instant toggling.

State lives only in memory — relaunching the app returns to locked.

## Project structure

```
qr-flare/
├── App.js                    # Navigation + providers
├── app.json                  # Expo config (iOS/Android perms, splash)
├── package.json
├── babel.config.js
└── src/
    ├── theme/colors.js       # Brand palette + gradient
    ├── context/PremiumContext.js
    ├── components/
    │   ├── FlareButton.js
    │   └── Logo.js
    └── screens/
        ├── HomeScreen.js
        ├── CreateScreen.js
        ├── PreviewScreen.js
        ├── UpgradeScreen.js
        └── CustomizeScreen.js
```

## Packages used

- `expo`, `expo-status-bar`, `expo-linear-gradient`
- `expo-image-picker` — pick logo
- `expo-media-library`, `expo-file-system` — save PNG to photo library
- `react-native-qrcode-svg` + `react-native-svg` — QR rendering
- `react-native-view-shot` — capture QR view as PNG
- `@react-navigation/native` + `@react-navigation/native-stack` — navigation

## What remains before App Store submission

- **Assets:** add `assets/icon.png` (1024×1024), `assets/splash.png`, `assets/adaptive-icon.png`, `assets/favicon.png`, then reference them back in `app.json` (`icon`, `splash`, `android.adaptiveIcon`, `web.favicon`).
- **Real IAP:** replace mock premium toggle with RevenueCat (recommended) or `expo-in-app-purchases`. Add "Restore Purchases".
- **Legal:** add Privacy Policy + Terms links on the Upgrade screen and in App Store listing.
- **Store listing:** screenshots (6.7" iPhone, 6.5" iPhone, 12.9" iPad), description, keywords, support URL.
- **Build + submit:** `npm install -g eas-cli`, `eas login`, `eas build:configure`, `eas build --platform ios`, `eas submit -p ios`.
- **Bundle IDs:** finalize `ios.bundleIdentifier` / `android.package` in `app.json`, register in App Store Connect.
- **Device testing:** real-device test the photo-library save flow on iOS + Android.
- **Optional polish:** SafeAreaProvider at root, haptics on button press, animated gradient accents, onboarding tooltip.
