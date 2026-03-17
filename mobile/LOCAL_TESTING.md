# SmartNote AI – Local Testing Guide

## Prerequisites

Before running the app, install the following:

### 1. Node.js & npm
```bash
node --version  # must be 18+
npm --version   # must be 9+
```

### 2. Expo CLI
```bash
npm install -g expo-cli eas-cli
```

### 3. Android Development Environment

**Option A – Android Emulator (Recommended for full testing)**

1. Install [Android Studio](https://developer.android.com/studio)
2. In Android Studio: `SDK Manager > SDK Tools` → check:
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools
3. Create a virtual device: `AVD Manager → Create Virtual Device`
   - Recommended: Pixel 7 Pro, API 34 (Android 14)
4. Set environment variables:
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

**Option B – Physical Android Device**

1. Enable Developer Options on your Android device:
   - Settings → About Phone → tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging → ON
3. Connect device via USB
4. Verify connection: `adb devices`

**Option C – Expo Go App (Quickest, limited native features)**

Install [Expo Go](https://expo.dev/go) from the Play Store. Some features (secure store, native camera) won't work.

---

## Setup

### 1. Clone and install dependencies

```bash
cd mobile
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
EXPO_PUBLIC_API_URL=https://your-smartnote-backend.com
```

**Getting Clerk Key:**
1. Go to [clerk.com](https://clerk.com) → Create App → "SmartNote AI"
2. Dashboard → API Keys → copy "Publishable Key"

**API URL:**
- If running backend locally: `http://10.0.2.2:3000` (Android emulator) or `http://localhost:3000`
- Production: your deployed backend URL

### 3. Start the app

```bash
# Start Metro bundler
npx expo start

# Then press:
#  a  - open in Android emulator
#  s  - switch to Expo Go mode
#  r  - reload app
```

Or run directly on Android:
```bash
npx expo run:android
```

---

## Testing Checklist

### Authentication
- [ ] Landing screen loads with hero and features
- [ ] "Get Started Free" → Sign Up screen
- [ ] Sign Up with email: enter name, email, password → get verification email
- [ ] Enter verification code → redirected to Dashboard
- [ ] Sign In with existing account
- [ ] Sign Out from Account tab

### Dashboard
- [ ] Dashboard loads with notebook grid
- [ ] Category filter chips work (All, Personal, Work, School, Research)
- [ ] Greeting shows user's name
- [ ] Quick action buttons navigate correctly
- [ ] FAB (+ button) opens Create Notebook
- [ ] Pull-to-refresh reloads notebooks

### Create Notebook
- [ ] Step 1: Enter title, select category
- [ ] Step 2: Browse 48+ templates with category filters
- [ ] Step 3: Pick theme color from 20 colors, preview updates
- [ ] Notebook appears in dashboard after creation

### Templates Gallery
- [ ] All 48+ templates displayed
- [ ] Category filter works
- [ ] Tapping template navigates to Create Notebook with template pre-selected

### Notebook Viewer – Template Tests

**Simple Template:**
- [ ] Lined paper background visible
- [ ] Text editor works, cursor follows
- [ ] Page tabs show (if multiple pages)
- [ ] Add page button creates new page
- [ ] Auto-save indicator appears after typing

**Diary Template:**
- [ ] Date header shows today
- [ ] Mood selector scrolls with 8 moods
- [ ] Main entry text input works
- [ ] Gratitude and Highlight sections

**Planner Template:**
- [ ] 7-day mini-calendar highlights today
- [ ] Add agenda items with time
- [ ] Toggle agenda item done
- [ ] Add goals

**Todo Template:**
- [ ] Add tasks with priority
- [ ] Progress bar updates
- [ ] Filter tabs (all/active/done) work
- [ ] Delete task

**Habit Tracker:**
- [ ] 7-day grid shows for each habit
- [ ] Tap cell to toggle completion
- [ ] Streak counter updates
- [ ] Add new habit with icon/color

**Expense Tracker:**
- [ ] Enter budget amount
- [ ] Add expense with category
- [ ] Progress bar changes color when over 80%
- [ ] Category breakdown chart

**Recipe Template:**
- [ ] Add recipe title, cook time, servings
- [ ] Add/remove ingredients
- [ ] Add/remove steps with numbering

**Flashcard Template:**
- [ ] Edit mode: add cards with difficulty
- [ ] Study mode: flip animation works
- [ ] Card counter shows progress

**Code Notebook:**
- [ ] Dark code editor renders
- [ ] Language chips change language
- [ ] Add text blocks and code blocks

**Goal Tracker:**
- [ ] Add goals with color, category, deadline
- [ ] Milestones with progress bar
- [ ] Toggle milestones updates progress %

**Budget Planner:**
- [ ] Income vs expense summary
- [ ] Category breakdown
- [ ] Savings rate bar

### AI Features
- [ ] AI Quick Panel opens in Notebook Viewer
- [ ] Chat button navigates to AI Chat
- [ ] Send message to AI Chat
- [ ] AI responds (requires valid API + OpenAI key in backend)

### Search
- [ ] Search bar focuses automatically
- [ ] Submit search shows results
- [ ] Tap result navigates to notebook

### Other Screens
- [ ] Trash: deleted notebooks appear
- [ ] Restore/permanent delete work
- [ ] Analytics: stats display
- [ ] Workspaces: create and join
- [ ] Friends: search, send requests, accept
- [ ] Notifications: list, mark read
- [ ] Pricing: plans display, billing toggle
- [ ] Account: profile, dark mode toggle, sign out

### Theme & Appearance
- [ ] Dark mode toggle works
- [ ] System theme respected on launch
- [ ] Notebook cover colors reflect chosen theme

---

## Common Issues & Fixes

### Metro bundler port conflict
```bash
npx expo start --port 8082
```

### Android emulator not detected
```bash
adb kill-server && adb start-server
npx expo run:android
```

### Clerk auth redirect issues
Add your development URL to Clerk dashboard:
- Dashboard → Configure → Paths → Add `exp://localhost:8081`

### API connection refused (Android emulator)
Android emulator cannot use `localhost`. Use:
- `10.0.2.2` to reach your host machine's localhost
- Example: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`

### Module not found errors
```bash
npx expo install --fix
npm install
```

### Build cache issues
```bash
npx expo start --clear
```

---

## Running Tests

Currently the project does not have automated tests. To add them:

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

Then create `__tests__/` directory with component tests.

Manual smoke test script — run through all screens in order:
1. Landing → Sign Up → Dashboard
2. Create Notebook (simple) → Open → Edit
3. Dashboard → Create (diary) → Open → switch pages
4. Templates Gallery → Select Recipe → Create
5. AI Chat → Send message
6. Search → query
7. Account → Dark Mode → Light Mode
8. Sign Out

---

## Backend Setup (Local)

If running the backend locally, refer to the root `/workspace/README.md`. Key env vars in the backend:
```env
MONGODB_URI=mongodb://localhost:27017/smartnote
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
```

Run backend:
```bash
cd /workspace  # root of web project
npm run dev    # starts Next.js on :3000
```

Then set mobile:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```
