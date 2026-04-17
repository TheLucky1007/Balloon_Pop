# Slap Happy

A personalized bubble-popping game for toddlers. Pop bubbles with family photos, learn names, numbers, letters, shapes, and colors — all with text-to-speech, sound effects, and background music.

## Features

- Family member bubbles with photo upload, face detection, and background blur
- 12 theme packs: Dinosaurs, Trucks, Dirt Bikes, Jungle Animals, Dogs, Cats, Cat Mode (fish), Iguana Mode (bugs), Numbers, ABCs, Shapes, Colors
- Text-to-speech with 12 accent options
- 6 background music modes (synthesized with Web Audio API)
- Combo/streak system with personalized encouragement
- Milestone celebrations at 5/10/15/25/50/75/100 pops
- All data stored locally — no server, no accounts, no tracking
- COPPA compliant

---

## Project Structure

```
slap-happy/
├── index.html          # Main app — all HTML + CSS
├── js/
│   ├── data.js         # Colors, family, themes, accents, IndexedDB
│   ├── audio.js        # TTS, pop SFX, theme SFX, background music, intro jingle
│   ├── game.js         # Game loop, rendering, tap handling, combos
│   ├── ad.js           # Cornhole 2 ad with floating bubbles + black hole
│   └── setup.js        # Setup screen, photos, modals, settings
├── privacy.html        # Privacy policy (required for app stores)
├── package.json        # Node dependencies for Capacitor
├── capacitor.config.ts # Capacitor configuration
└── README.md           # This file
```

---

## Building for App Stores

### Prerequisites

- **Node.js** 18+ installed (https://nodejs.org)
- **For iOS:** Mac with Xcode 15+ installed, Apple Developer account ($99/year)
- **For Android:** Android Studio installed, Google Play Developer account ($25 one-time)

### Step 1: Install dependencies

```bash
cd slap-happy
npm install
```

### Step 2: Prepare the web app

This copies your app files into the `www/` folder that Capacitor serves from:

```bash
npm run prepare
```

### Step 3: Initialize Capacitor (first time only)

```bash
npx cap init "Slap Happy" com.slaphappy.app --web-dir www
```

Note: If capacitor.config.ts already exists, you can skip this — it's already configured.

### Step 4: Add platforms

```bash
# For iOS
npx cap add ios

# For Android
npx cap add android
```

### Step 5: Copy web files to native projects

Run this every time you change your web code:

```bash
npm run prepare
npx cap copy
```

Or sync (copies + updates native plugins):

```bash
npm run prepare
npx cap sync
```

### Step 6: Open in IDE and build

```bash
# iOS — opens Xcode
npx cap open ios

# Android — opens Android Studio
npx cap open android
```

---

## iOS: Building and Submitting

1. **In Xcode:**
   - Select your Team (Apple Developer account) in Signing & Capabilities
   - Set the Bundle Identifier to `com.slaphappy.app` (or your own)
   - Set Deployment Target to iOS 14.0+
   - Under Info.plist, add:
     - `NSCameraUsageDescription` → "Slap Happy uses your camera to take family photos"
     - `NSPhotoLibraryUsageDescription` → "Slap Happy accesses your photos to add family pictures"

2. **App Icons:**
   - You need a 1024x1024 app icon
   - Use https://appicon.co to generate all required sizes
   - Drag the generated icons into `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

3. **App Store listing:**
   - Category: Kids (Ages 5 & Under) or Education
   - Age Rating: 4+
   - Privacy Policy URL: Host privacy.html somewhere (even a simple GitHub Pages link works)
   - Screenshots: Take on simulator for iPhone 6.7", 6.5", 5.5" and iPad 12.9"

4. **Build and upload:**
   - Product → Archive in Xcode
   - Upload to App Store Connect
   - Submit for review

---

## Android: Building and Submitting

1. **In Android Studio:**
   - Open the `android/` folder
   - Update `android/app/src/main/AndroidManifest.xml` if needed
   - Set `minSdkVersion` to 22 in `android/app/build.gradle`

2. **App Icons:**
   - Replace icons in `android/app/src/main/res/mipmap-*/`
   - Use https://appicon.co or Android Studio's Image Asset tool

3. **Build signed APK/AAB:**
   - Build → Generate Signed Bundle / APK
   - Choose Android App Bundle (AAB) for Play Store
   - Create a keystore (save it safely — you need it for every update)

4. **Google Play Console:**
   - Create app → target age: Under 5
   - Content rating: IARC questionnaire (answer honestly — no violence, no data collection)
   - Privacy Policy URL required
   - Upload AAB, add screenshots, write listing, submit

---

## Running Locally (for testing)

Double-click `index.html` to open in browser. Note: IndexedDB (photo/settings persistence) may not work from `file://`. For full local testing:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

---

## App Store Tips for Kid Apps

- **Apple "Kids" category** requires: no third-party ads, no links out of the app, no data collection, no in-app purchases without parental gate. Slap Happy already meets all of these.
- **Google "Designed for Families"** has similar requirements. The fake Cornhole 2 ad is internal and doesn't link anywhere, so it's fine.
- **Both stores** require a privacy policy URL. Host `privacy.html` anywhere publicly accessible.
- **Screenshots sell the app.** Show: the bubble game in action, the setup screen with photos, theme packs, the combo system. Bright, colorful screenshots with a real kid's hand tapping (if possible) convert well.

---

## Updating the App

When you change the web code:

```bash
npm run prepare
npx cap copy
```

Then rebuild in Xcode / Android Studio and submit an update.

---

## Bundle ID

The default bundle ID is `com.slaphappy.app`. Change this to something unique to you in:
- `capacitor.config.ts`
- Xcode project settings
- `android/app/build.gradle`

Use a reverse-domain format like `com.yourname.slaphappy`.
