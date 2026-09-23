# Egyptian Exchange Mobile App

A Capacitor 6 mobile app that wraps the Egyptian Exchange website (https://x.elmezlawyholding.com/) for Android and iOS.

## Project Structure

```
egyptian-exchange-mobile-app/
├── www/                    # Website files (HTML/CSS/JS)
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── config.js       # API URLs and settings
│   │   ├── api.js          # Fetch exchange rates & branches
│   │   ├── main.js         # Preloader, scroll, drawer
│   │   ├── navigation.js
│   │   ├── lang.js         # Arabic/English language
│   │   ├── currencies.js
│   │   ├── converter.js    # Currency converter
│   │   └── branches.js     # Branch map & list
│   └── assets/             # Flags, branch images
├── resources/              # Source icons/splash (SVG)
├── android/                # Native Android project (generated)
├── ios/                    # Native iOS project (generated)
├── capacitor.config.json   # Capacitor app configuration
├── codemagic.yaml          # Codemagic CI/CD workflows
├── .github/workflows/      # GitHub Actions CI
└── package.json
```

## Prerequisites

- Node.js 20+
- npm
- Capacitor CLI (`npm install -g @capacitor/cli`)

## Local Development

```bash
# Install dependencies
npm install

# Add native platforms (first run)
npx cap add android
npx cap add ios

# Generate app icons & splash screens
npx capacitor-assets generate --ios --android

# Sync web assets to native projects
npx cap sync

# Open in IDE
npx cap open android   # Android Studio
npx cap open ios       # Xcode
```

## Building for Production

### Android (Google Play)

1. Generate a keystore:
```bash
keytool -genkeypair -v -keystore upload.keystore \
  -alias exchange -keyalg RSA -keysize 2048 -validity 10000
```

2. Base64-encode the keystore:
```bash
base64 -i upload.keystore
```

3. Set these environment variables in **Codemagic** (Environment tab, as Secret variables):
   | Variable | Value |
   |---|---|
   | `KEYSTORE_PASSWORD` | Your keystore password |
   | `KEY_ALIAS` | `exchange` |
   | `KEY_PASSWORD` | Your key password |
   | `UPLOAD_KEYSTORE` | Base64-encoded keystore content |
   | `PLAY_STORE_JSON_KEY` | Google Play Service Account JSON key |

4. Push to the `build` branch to trigger the `android-release` workflow.

### iOS (App Store)

1. Create an **App Store Connect API Key** (Users & Access → Keys → +):
   - Select **App Store Connect API** role
   - Download the `.p8` file
   - Note the **Key ID** and **Issuer ID**

2. Set these environment variables in **Codemagic** (Environment tab, as Secret variables):
   | Variable | Value |
   |---|---|
   | `APPSTORE_KEY_ID` | Key ID (e.g. `2X9R4HXF34`) |
   | `APPSTORE_ISSUER_ID` | Issuer ID (UUID) |
   | `APPSTORE_PRIVATE_KEY` | Full content of the `.p8` file |

3. Enable **Automatic code signing** in Codemagic project settings.

4. Push to the `build` branch to trigger the `ios-release` workflow.

## CI/CD Pipeline

This project uses two CI/CD systems working together:

### GitHub Actions → Codemagic

- **`.github/workflows/codemagic-trigger.yml`** fires on:
  - Push to `main` → triggers **Android Debug APK** build
  - Git tag `v*.*.*` → triggers **Android Release** + **iOS Release** builds

- **GitHub Secrets** required (set in repo Settings → Secrets):
  | Secret | Value |
  |---|---|
  | `CODEMAGIC_API_KEY` | Codemagic API key (Account Settings → API) |
  | `CODEMAGIC_ANDROID_DEBUG_WORKFLOW_ID` | Android debug workflow ID |
  | `CODEMAGIC_ANDROID_RELEASE_WORKFLOW_ID` | Android release workflow ID |
  | `CODEMAGIC_IOS_RELEASE_WORKFLOW_ID` | iOS release workflow ID |

### Codemagic Workflows

| Workflow | Trigger | Output |
|---|---|---|
| `android-debug` | Manual or GitHub push to `main` | Debug APK (for testing) |
| `android-release` | GitHub tag or push to `build` | Signed AAB → Google Play (draft) |
| `ios-release` | GitHub tag or push to `build` | Signed IPA → App Store Connect |

## Publishing to App Stores

### Google Play Store

1. Create a **Google Play Developer** account ($25 one-time fee)
2. Create a **Service Account** in Google Play Console:
   - Go to Settings → API Access → Create Service Account
   - Grant **Release manager** role
   - Download the JSON key file
   - Set as `PLAY_STORE_JSON_KEY` in Codemagic
3. Create your app listing in Google Play Console (title, description, screenshots, icon)
4. Push a git tag (e.g. `v1.0.0`) to trigger the release build
5. The AAB will be uploaded to the **Internal testing** track as a **draft**
6. Review and roll out from the Play Console

### Apple App Store

1. Enroll in the **Apple Developer Program** ($99/year)
2. Create your app in **App Store Connect**:
   - App Name: "المصرية للصرافة"
   - Bundle ID: `com.elmezlawyholding.exchange`
   - SKU: your choice
3. Push a git tag (e.g. `v1.0.0`) to trigger the release build
4. The IPA will be uploaded to App Store Connect
5. Fill in app metadata, screenshots, and submit for review

## Notes

- The app loads content from the `www/` directory (offline-capable PWA)
- Exchange rates and branch data are fetched live from the API
- The current API endpoints point to internal servers — update `www/js/config.js` if the API URLs change
- Native platforms (`android/`, `ios/`) are auto-generated and gitignored
- App icons and splash screens can be customized via `resources/icon.svg` and `resources/splash.svg`
