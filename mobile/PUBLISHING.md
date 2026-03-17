# SmartNote AI – Publishing Guide

## Overview

This guide covers publishing the SmartNote AI Android (and optionally iOS) app to the Google Play Store using Expo Application Services (EAS Build).

---

## Part 1: Setup & Configuration

### 1.1 Create Expo Account

1. Sign up at [expo.dev](https://expo.dev)
2. Verify your email
3. Login in terminal:
   ```bash
   eas login
   ```

### 1.2 Configure EAS

```bash
cd mobile
eas init --id YOUR_PROJECT_ID
```

Or manually, create `eas.json`:

```json
{
  "cli": {
    "version": ">= 10.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 1.3 Configure app.json

Ensure `app.json` has correct values:

```json
{
  "expo": {
    "name": "SmartNote AI",
    "slug": "smartnote-ai",
    "version": "1.0.0",
    "android": {
      "package": "com.smartnoteai.app",
      "versionCode": 1
    }
  }
}
```

**Package naming rules:**
- Must be globally unique on Play Store
- Format: `com.yourcompany.appname`
- Cannot be changed after publishing

### 1.4 Set Environment Secrets in EAS

```bash
eas secret:create --scope project --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "pk_live_YOUR_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://your-api.com"
```

---

## Part 2: Google Play Store Setup

### 2.1 Create Google Play Developer Account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay one-time $25 registration fee
3. Complete identity verification (1-3 business days)

### 2.2 Create App Listing

1. Google Play Console → **Create app**
2. Fill in:
   - App name: `SmartNote AI`
   - Default language: English (United States)
   - App or game: **App**
   - Free or paid: Free (with in-app purchases)
3. Accept policies → **Create app**

### 2.3 App Information (Store Listing)

Navigate to **Store presence → Main store listing**:

**Title:** SmartNote AI – Notebook & AI Notes

**Short description (80 chars):**
> AI-powered notebook app with 48+ templates, smart writing, and collaboration

**Full description (4000 chars):**
```
SmartNote AI is the most powerful AI-assisted note-taking app, combining the nostalgic feel of physical notebooks with modern generative AI.

📚 48+ Notebook Templates
Choose from over 48 templates designed for every use case:
• Simple Notebook – classic writing with page flipping
• Diary – mood tracking, gratitude log, daily reflections  
• Planner – agenda, goals, and weekly calendar
• Meeting Notes – pinned notes, action items, attendees
• Todo List – priorities, progress tracking, deadlines
• Habit Tracker – 7-day grid, streaks, custom habits
• Expense Tracker – budget tracking, category breakdown
• Code Notebook – syntax-highlighted code blocks, output
• Flashcards – study mode with flip animations
• Goal Tracker – SMART goals, milestones, progress
• Budget Planner – income/expense tracking, savings goals
• Recipe Book – ingredients, steps, cook timer
• Research Builder – AI-powered research with sources
• And 35+ more!

⚡ AI Assistant
• Auto-complete your writing
• Improve and rewrite content
• Generate outlines
• Ask questions about your notes
• Generate images from prompts
• Voice-to-text transcription

👥 Collaboration
• Share notebooks with view, edit, or comment access
• Real-time collaboration with Liveblocks
• Workspaces with team roles
• Friend system for sharing

📊 Analytics
• Track your writing streaks
• See insights about your productivity
• Notebook statistics and word counts

🎨 Beautiful Design
• 20+ notebook theme colors
• Paper patterns: lined, grid, dotted, blank
• Dark mode support
• Multiple font styles

Free to start. Upgrade for unlimited notebooks and AI credits.
```

### 2.4 Required Assets

Create these assets before submitting:

| Asset | Dimensions | Format |
|-------|------------|--------|
| App icon | 512×512 | PNG (no alpha) |
| Feature graphic | 1024×500 | JPG or PNG |
| Screenshots (phone) | 1080×1920 (min) | JPG or PNG, at least 2 |
| Screenshots (tablet 7") | Optional | Same format |
| Screenshots (tablet 10") | Optional | Same format |

**Screenshot content to capture (using emulator):**
1. Landing screen with hero gradient
2. Dashboard with notebook cards
3. Simple Template with lined paper
4. Diary with mood tracker
5. Templates Gallery showing 48+ templates
6. AI Chat in conversation
7. Analytics screen with stats

### 2.5 Content Rating

1. Go to **Policy → App content → Content rating**
2. Fill questionnaire honestly:
   - No violence, no sexual content, no profanity
   - Everyone (E) rating expected
3. Submit for rating

### 2.6 Data Safety

Go to **Policy → App content → Data safety**:

- Location: No
- Personal info:
  - Name: Yes, shared with third parties (Clerk)
  - Email: Yes, shared with third parties (Clerk)
- App activity:
  - App interactions: Yes, not shared
  - In-app search history: Yes, not shared
- No financial info (payments handled via Stripe web)

### 2.7 Pricing & Distribution

1. Go to **Monetize → Pricing & distribution**
2. Set price: Free
3. Countries: Select all or specific regions
4. Distributed to: All devices that meet minimum requirements

---

## Part 3: Build & Sign

### 3.1 Generate Keystore (Production Signing)

EAS can manage signing for you (recommended):

```bash
eas credentials
# Select: Android → Production → Generate new keystore
```

Or provide your own:
```bash
# Generate manually
keytool -genkey -v -keystore smartnote.keystore -alias smartnote -keyalg RSA -keysize 2048 -validity 10000

# Upload to EAS
eas credentials --platform android
```

**CRITICAL:** Back up your keystore file and password. If lost, you cannot publish updates.

### 3.2 Build for Production

```bash
# Build Android App Bundle (.aab) for Play Store
eas build --platform android --profile production
```

This will:
1. Upload your code to EAS servers
2. Build using the configured Android SDK
3. Sign with your keystore
4. Output a `.aab` file download URL

Build takes approximately 5–15 minutes. Track at [expo.dev/builds](https://expo.dev/builds).

### 3.3 Test with Preview Build (APK)

Before production, test with an APK:
```bash
eas build --platform android --profile preview
```

Download the `.apk` and install on device:
```bash
adb install smartnote-preview.apk
```

---

## Part 4: Submit to Play Store

### 4.1 Manual Upload

1. Download the `.aab` from EAS dashboard
2. Google Play Console → **Release → Production → Create new release**
3. Upload the `.aab`
4. Fill release notes:
   ```
   Initial release of SmartNote AI
   
   Features:
   • 48+ notebook templates
   • AI writing assistant
   • Real-time collaboration  
   • Dark mode
   • Friends and sharing
   ```
5. **Review release** → **Start rollout to Production**

### 4.2 Automated Submit (via EAS)

```bash
# First time: create Google service account
# Go to Google Play Console → Setup → API access → Create service account
# Grant "Release manager" role
# Download JSON key as service-account.json

eas submit --platform android --profile production
```

### 4.3 Review Timeline

- Google Play review typically takes **1–7 business days** for new apps
- Subsequent updates are usually reviewed in **hours to 2 days**
- You'll receive email notifications

---

## Part 5: Post-Publishing

### 5.1 App Updates

When making changes:

1. Update `versionCode` in `app.json` (must be higher than previous):
   ```json
   "android": {
     "versionCode": 2
   }
   ```
2. Optionally update `version` (user-facing):
   ```json
   "version": "1.1.0"
   ```
3. Build and submit:
   ```bash
   eas build --platform android --profile production
   eas submit --platform android --latest
   ```

### 5.2 Staged Rollout

For production updates, use staged rollout:
1. Play Console → Production → Create new release
2. Under "Release to production" set percentage (e.g., 10%)
3. Monitor crash reports before increasing

### 5.3 Crash Monitoring

Set up crash reporting:
```bash
npm install expo-updates @sentry/react-native --legacy-peer-deps
```

Then in `App.tsx`:
```tsx
import * as Sentry from '@sentry/react-native';
Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });
```

### 5.4 Push Notifications

To enable push notifications (friend requests, shared notebooks):

1. Set up Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android app with package `com.smartnoteai.app`
3. Download `google-services.json` → place in project root
4. Add to `app.json`:
   ```json
   "android": {
     "googleServicesFile": "./google-services.json"
   }
   ```
5. Install Expo Notifications:
   ```bash
   npx expo install expo-notifications expo-device
   ```

### 5.5 Deep Link Testing

Test share links open in the app:
```bash
# Android
adb shell am start -W -a android.intent.action.VIEW -d "smartnote://share/test123" com.smartnoteai.app
```

---

## Part 6: iOS App Store (Optional)

If publishing to iOS:

### Requirements
- Mac with Xcode 15+
- Apple Developer Account ($99/year) at [developer.apple.com](https://developer.apple.com)
- App Store Connect account

### Build for iOS
```bash
eas build --platform ios --profile production
```

### Submit
```bash
eas submit --platform ios --latest
```

App Store review is typically 1–3 days. More strict review criteria than Google Play.

---

## Environment Differences

| Env | Clerk Key | API URL | Build Type |
|-----|-----------|---------|------------|
| Development | `pk_test_...` | `http://10.0.2.2:3000` | APK |
| Staging/Preview | `pk_test_...` | `https://staging-api.com` | APK |
| Production | `pk_live_...` | `https://api.smartnoteai.com` | AAB |

---

## Checklist Before Publishing

- [ ] App name and package ID finalized in `app.json`
- [ ] Version code set to 1 (or incremented)
- [ ] Production Clerk publishable key configured
- [ ] Production API URL configured
- [ ] Keystore backed up securely
- [ ] All 48+ templates tested on device
- [ ] Auth flow (sign up, verify, sign in, sign out) tested
- [ ] Dark mode tested
- [ ] Screenshots captured (2 minimum)
- [ ] Store listing text written
- [ ] Feature graphic created (1024×500)
- [ ] Icon is 512×512 PNG without alpha
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] Privacy policy URL available
- [ ] Terms of service URL available
- [ ] Target audience: 13+ (contains AI features)
