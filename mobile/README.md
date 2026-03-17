# SmartNote AI – React Native Android App

A full-featured React Native Android app that is the mobile version of the SmartNote AI web application with exact feature parity, visual design, and all 48+ notebook templates.

## Features

### Core Features
- **48+ Notebook Templates** – Simple, Diary, Planner, Meeting Notes, Todo, Habit Tracker, Expense Tracker, Journal, Code Notebook, AI Research, and 38+ more
- **AI Assistant** – Complete text, improve writing, generate outlines, Q&A on content, image generation, voice transcription
- **AI Chat** – Notebook-scoped and general AI chat
- **Collaboration** – Liveblocks real-time cursors, comments, @mentions, workspaces
- **Sharing** – Share with links (view/edit/comment access), password protection, expiry, watermark
- **Friends & Social** – Send/accept friend requests, share notebooks with friends
- **Subscriptions** – Free/Pro/Ultra plans with Stripe payments
- **Analytics** – Writing streaks, insights, category breakdown
- **Search** – Full-text and AI-powered semantic search
- **Trash** – Soft delete with 30-day expiry
- **Dark Mode** – Full light/dark/system theme support

### Templates (48+)
| Category | Templates |
|----------|-----------|
| Basic | Simple Notebook, Custom Pages |
| Productivity | Planner, Todo List, Goal Tracker, Mind Map |
| Work | Meeting Notes, Document, Dashboard, Project, Project Pipeline, Loop |
| AI | AI Research, AI Prompt Studio, Prompt Diary, Image Prompts, Video Prompts, Sound Box |
| Education | Study Book, Flashcards, Class Notes, Research Builder, Tutorial Learn, Book Notes, Vocabulary, Piano Notes |
| Personal | Diary, Journal, Habit Tracker, Workout Log |
| Finance | Expense Tracker, Budget Planner, Expense Sharer |
| Creative | Doodle, Story, Storytelling, Typewriter, Sticker Book, Whiteboard |
| Lifestyle | Recipe Book, Grocery List, Meals Planner, Games Scorecard |
| Travel | Trip Planner |
| Events | Save the Date |
| Tools | Language Translator, Dictionary, Important URLs |
| Tech | Code Notebook, n8n Workflows |

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio + emulator, or physical Android device with Expo Go

### Installation

```bash
cd mobile
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_URL=https://your-smartnote-backend.com
```

### Running

```bash
# Start Expo dev server
npm start

# Run on Android emulator
npm run android

# Run on iOS
npm run ios
```

## Architecture

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/          # Landing, SignIn, SignUp
│   │   ├── dashboard/     # Dashboard, CreateNotebook, EditNotebook, Trash, SharedNotebooks
│   │   ├── notebook/      # NotebookViewer
│   │   ├── templates/     # Templates Gallery
│   │   ├── search/        # Search
│   │   ├── account/       # Account, Settings
│   │   ├── ai/            # AI Chat
│   │   ├── analytics/     # Analytics
│   │   ├── workspaces/    # Workspaces
│   │   ├── friends/       # Friends
│   │   ├── notifications/ # Notifications
│   │   └── pricing/       # Pricing
│   ├── components/
│   │   ├── ui/            # Button, Input, Card
│   │   ├── templates/     # 8 template components (Simple, Diary, Planner, etc.)
│   │   └── NotebookCard   # Notebook card with gradient cover
│   ├── navigation/        # React Navigation stack + tabs
│   ├── services/          # API service layer (all endpoints)
│   ├── store/             # Zustand state management
│   ├── hooks/             # useTheme
│   ├── theme/             # Colors, spacing, design tokens
│   ├── constants/         # Templates config (48 templates)
│   └── types/             # TypeScript types
└── App.tsx
```

## Tech Stack

| Package | Purpose |
|---------|---------|
| Expo SDK 51 | React Native framework |
| @clerk/clerk-expo | Authentication |
| @react-navigation/native | Navigation |
| expo-linear-gradient | Gradient effects |
| @expo/vector-icons (Ionicons) | Icons |
| zustand | State management |
| axios | HTTP client |
| date-fns | Date formatting |
| react-native-reanimated | Animations |
| expo-secure-store | Secure token storage |
| expo-image-picker | Photo uploads |
| expo-av | Audio/video for transcription |

## Design System

### Brand Colors
- Primary gradient: Amber `#f59e0b` → Orange `#f97316`
- Accent: Purple `#a855f7`
- Leather: `#8B4513`
- Paper cream: `#fffbeb`

### Theme
- Light/dark/system mode with class-based theming
- 20+ notebook theme colors
- Paper patterns: lined, grid, dotted, blank
- Font styles: sans, serif, handwritten

## API Integration

All API calls go to the existing SmartNote AI backend. Set `EXPO_PUBLIC_API_URL` to your backend URL.

Endpoints used:
- `/api/notebooks` – CRUD notebooks
- `/api/notebooks/[id]/pages` – CRUD pages
- `/api/ai/*` – All AI features
- `/api/friends/*` – Social features
- `/api/workspaces` – Workspaces
- `/api/notifications` – Notifications
- `/api/subscription/*` – Plans & billing
- `/api/analytics/*` – Stats & insights
- `/api/search` – Search

## Android-Specific Notes

- Hardware back button handled by React Navigation
- Deep links: `smartnote://share/[shareId]`
- Push notifications via FCM (configurable)
- System dark/light mode respected
- Landscape/portrait orientation (portrait locked by default)
