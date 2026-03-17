# Build SmartNote AI as APK (Personal Use)

No Play Store. No review. Just install the APK on your Android phone.

---

## What You Need

| Tool | Required | Get it from |
|------|----------|-------------|
| Node.js 18+ | Yes | nodejs.org |
| Expo account | Yes (free) | expo.dev/signup |
| EAS CLI | Yes | `npm install -g eas-cli` |
| Android phone | Yes | Enable "Install from unknown sources" |

That's it. You do **not** need Android Studio, a Java SDK, or a Google Play account.

---

## Step 1 — Fill in Your .env File

Create `/workspace/mobile/.env` (copy from `.env.example`):

```env
# Your Clerk app's publishable key
# Get from: https://dashboard.clerk.com → Your App → API Keys
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx

# URL of your running SmartNote AI backend
# If the web app is deployed: use its domain
# If running locally: use your computer's local IP (see note below)
EXPO_PUBLIC_API_URL=https://your-smartnote-domain.com
```

> **Finding your local IP (if backend is on your computer):**
> - Windows: run `ipconfig` → look for IPv4 Address (e.g. `192.168.1.10`)
> - Mac/Linux: run `ifconfig` → look for `inet` under `en0`
> - Then use: `EXPO_PUBLIC_API_URL=http://192.168.1.10:3000`
> - Your phone and computer must be on the **same WiFi network**

---

## Step 2 — Install Dependencies

```bash
cd /workspace/mobile
npm install
```

---

## Step 3 — Log in to Expo

```bash
eas login
# Enter your expo.dev email and password
```

---

## Step 4 — Link Your Project

```bash
eas init
# When asked "Would you like to create a project for @yourname/smartnote-ai?" → Yes
```

This creates a project on expo.dev and links it. Free.

---

## Step 5 — Build the APK

```bash
eas build --platform android --profile preview
```

This uploads your code to Expo's cloud servers and builds an APK.
- Takes about **5–10 minutes**
- It's **free** (Expo free tier gives 30 builds/month)
- You'll get a download URL when done

Watch the build at: https://expo.dev/builds

---

## Step 6 — Install on Your Phone

When the build finishes, you'll see something like:

```
Build finished.
APK: https://expo.dev/artifacts/eas/xxxxxxxx.apk
```

**Two ways to install:**

**Option A — Download on phone directly:**
1. Open the URL on your phone's browser
2. Tap Download
3. Open the downloaded `.apk` file
4. Tap Install (if prompted about unknown sources, go to Settings → Security → Allow from this source)

**Option B — Install via USB cable:**
```bash
# Download APK to your computer first, then:
adb install ~/Downloads/smartnote-preview.apk
```

---

## Done!

The app is installed. Open it, sign in with Clerk, and it connects to your SmartNote AI backend.

---

## Rebuilding After Code Changes

Whenever you update the code:

```bash
cd /workspace/mobile
eas build --platform android --profile preview
```

Download and reinstall the new APK. Your data stays intact (it's in MongoDB).

---

## Troubleshooting

**"App not installed" error on phone**
→ Uninstall any previous version first, then install the new APK.

**"Parse error" when installing**
→ The APK didn't download fully. Try downloading again.

**App opens but shows "Network Error"**
→ Your `EXPO_PUBLIC_API_URL` is wrong or the backend isn't running.
→ If using local IP, make sure phone and computer are on the same WiFi.

**Clerk sign-in doesn't redirect properly**
→ Go to https://dashboard.clerk.com → Your App → Configure → Paths
→ Add `exp://` and `smartnote://` to allowed redirect URLs

**Build fails on EAS**
→ Check the build logs at expo.dev/builds
→ Most common cause: missing env variable in `.env`

---

## Optional: Keep App Updated Automatically (OTA Updates)

For small JS/UI changes, you can push updates **without rebuilding the APK**:

```bash
eas update --branch preview --message "Fixed bug in diary template"
```

The app will pick up the update automatically the next time it's opened.
This only works for JavaScript changes — native code changes still need a full rebuild.
