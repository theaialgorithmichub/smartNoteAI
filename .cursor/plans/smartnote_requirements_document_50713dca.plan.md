---
name: SmartNote Requirements Document
overview: Create a comprehensive requirements document that captures all implemented features, styles, and technical specifications of the SmartNote AI web app for use in building a React Native Android app with identical functionality and visual design.
todos: []
isProject: false
---

# SmartNote AI Requirements Document for React Native Android App

## Purpose

This document will capture every implemented feature, UI pattern, and technical detail of the SmartNote AI web app so a React Native Android app can be built with exact visual parity and feature parity.

---

## 1. Document Structure

The requirements document will be organized into these sections:

### 1.1 Product Overview

- **App name**: SmartNote AI (short: SmartNote)
- **Tagline**: AI-powered note-taking platform with 50+ templates
- **Categories**: productivity, education, business
- **Core value prop**: Nostalgic physical notebook feel + Generative AI power

### 1.2 Authentication

- **Provider**: Clerk
- **Flows**: Sign-in, Sign-up, Session management
- **User sync**: Clerk `clerkId` maps to MongoDB User document
- **Screens**: Sign-in, Sign-up (Clerk-hosted or custom)

### 1.3 Core Screens and Navigation


| Screen            | Route                        | Purpose                                                     |
| ----------------- | ---------------------------- | ----------------------------------------------------------- |
| Landing           | `/`                          | Hero, features, AI demo; redirect to dashboard if signed in |
| Dashboard         | `/dashboard`                 | Bookshelf, notebook cards, category filters                 |
| Notebook Viewer   | `/dashboard/notebook/[id]`   | Full notebook with header, page navigation                  |
| Templates Gallery | `/templates`                 | Template selection and creation                             |
| Search            | `/dashboard/search`          | Full-text and AI search                                     |
| Settings          | `/dashboard/settings`        | App preferences                                             |
| Trash             | `/dashboard/trash`           | Soft-deleted notebooks (30-day expiry)                      |
| Shared View       | `/share/[shareId]`           | Public read-only shared notebook                            |
| Workspaces        | `/dashboard/workspaces`      | Workspace management                                        |
| Account           | `/account`                   | Profile and subscription                                    |
| Pricing           | `/pricing`                   | Plans (free/pro/ultra)                                      |
| Analytics         | `/analytics`                 | User stats, streaks, insights                               |
| Marketplace       | `/marketplace`               | Community templates                                         |
| Admin             | `/admin`, `/admin/dashboard` | Admin-only tools                                            |


### 1.4 Feature Requirements (Functional)

**Notebook Management**

- Create notebook (title, category, template selection)
- Edit notebook (title, category, appearance: cover image, theme color, page color, paper pattern, font style)
- Delete (soft delete, move to trash)
- Restore from trash
- Filter by category: All, Personal, Work, School, Research

**Notebook Appearance**

- Cover: image URL or gradient (theme color)
- Theme color picker (20+ colors: leather brown, navy blue, forest green, burgundy, pastels, etc.)
- Page color (cream #fffbeb default, dark page support)
- Paper patterns: lined, grid, dotted, blank
- Font style: sans, serif, handwritten

**Sharing**

- Share link creation (view/edit/comment access)
- Optional password, expiry date, max views
- Allow download, allow print, watermark
- Share with friends (FriendRequest flow)
- Revoke sharing

**Collaboration**

- Liveblocks: real-time cursors, presence
- Comments panel
- @mention in editor
- Workspaces: owner/admin/editor/viewer roles, invite code

**AI Features**

- In-editor AI: complete, improve, outline, ask
- Notebook chat sidebar
- Public chat (general AI)
- Image generation
- Transcription (voice-to-text)
- Auto-tagging, suggestions
- Deep research with sources

**Friends and Social**

- Send/accept/reject friend requests
- Search friends
- Share notebooks with friends

**Subscriptions**

- Plans: free, pro, ultra
- Stripe checkout
- Credits system
- Template selection limits per plan

**Other Features**

- Favorites (templates)
- Full-text search
- Import/Export
- API keys (scoped permissions)
- Notifications (friend request, shared notebook)
- Offline handling

### 1.5 Templates (48 total)

Each template must be specified with:

- Template ID (e.g. `save-the-date`, `tutorial-learn`)
- Display name
- Storage pattern: page-based HTML vs JSON (page title like `__save_the_date_template__`)
- Key UI elements and behaviors

**JSON-backed templates** (use dedicated page for structured data):
`save-the-date`, `tutorial-learn`, `planner`, `diary`, `document`, `dashboard`, `trip`, `loop`, `project`, `prompt-diary`, `ai-research`, `code-notebook`, `whiteboard`, `studybook`

**Page-based templates**: All others store content in standard Page documents with HTML content.

Notable template behaviors:

- **Save the Date**: Events array (title, date, time, url, reminder, category), countdown badges, upcoming alerts, animated card stack
- **Tutorial Learn**: Projects with steps and sections, images, PDF export
- **Simple**: Page flip, Quill/Tiptap rich text, AI toolbar
- **Planner**: Agenda items, goals, day notes, mini calendar
- **Doodle**: Drawing canvas, layers, colors

### 1.6 UI/UX Requirements (Styles)

**Design System**

- Semantic colors: background, foreground, primary, secondary, muted, accent, card, destructive, border, ring, input, popover
- HSL-based CSS variables for light/dark
- Border radius: `lg`, `md`, `sm` (from `--radius`)

**Brand Colors**

- Primary gradient: amber to orange (`from-amber-400 to-orange-500`)
- Accent: purple (`text-purple-500`, `bg-purple-100`)
- Leather: `#8B4513`, `#654321`, `#3D2914`
- Paper: cream `#FDF5E6`, white `#FAFAFA`, aged `#F5E6D3`

**Theme**

- Dark mode: class-based (`darkMode: ["class"]`)
- Light/dark/system toggle
- `[data-color-theme]` variants (leather-brown, navy-blue, forest-green, etc.)

**Components**

- Buttons: default, destructive, outline, secondary, ghost, link
- Cards: base card, GlareCard (glare effect on hover)
- Dialogs, dropdowns, popovers, tooltips
- Inputs, search bar, prompt input
- Loading: cubes, skeleton shimmer

**Layout**

- Sticky header: `bg-white/95 dark:bg-black/95 backdrop-blur-md`
- Max content width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Notebook cards: gradient or cover image, category badge, page count, updated date

**Visual Effects**

- Gradients (hero, cards, notebook spines)
- Paper patterns: `paper-lined`, `paper-grid`, `paper-dotted`, `paper-blank`
- Framer Motion / GSAP for page flip, accordions, fade/slide
- Glare effect on notebook cards

### 1.7 Data Models and API

**API Base**: REST endpoints under `/api/`

**Notebooks**: `GET/POST /notebooks`, `GET/PATCH/DELETE /notebooks/[id]`, `GET/POST /notebooks/[id]/pages`, `PATCH/DELETE /notebooks/[id]/pages/[pageId]`

**Share**: `GET /api/share/[shareId]`, `GET /api/share/[shareId]/notebook`

**Upload**: `POST /api/upload` (FormData: file, type "cover"|"attachment") → Cloudinary

**AI**: `/api/ai/complete`, `/api/ai/improve`, `/api/ai/outline`, `/api/ai/ask`, `/api/ai/transcribe`, `/api/ai/generate-image`, etc.

**Other**: Friends, Workspaces, Subscription, Notifications, Search, Chat, Liveblocks-auth, Webhooks (Clerk, Stripe)

**Schema Summary**:

- Notebook: userId, title, category, template, appearance, tags, isTrashed, sharedWith, pageCount
- Page: notebookId, chapterId, pageNumber, title, content (HTML), contentPlainText, attachments
- Chapter: notebookId, title, orderIndex, color
- Share: notebookId, shareId, accessType, password, expiresAt, maxViews, currentViews
- User: clerkId, email, name, avatar, isAdmin, friends
- Workspace, FriendRequest, Notification, Subscription, etc.

### 1.8 External Services

- **Clerk**: Auth
- **MongoDB**: Data (Mongoose)
- **Cloudinary**: Images
- **Liveblocks**: Real-time collaboration
- **Stripe**: Payments

### 1.9 PWA / Mobile-Ready Elements

- Manifest: name, short_name, theme_color `#3B82F6`, background_color
- Icons: 72, 96, 128, 144, 152, 192, 384, 512 px
- Shortcuts: New Notebook, Analytics
- Share target: receive title, text, url
- Categories: productivity, education, business

---

## 2. Deliverable Format

The final requirements document should be a **Markdown or structured document** (e.g. `REQUIREMENTS.md` or `REQUIREMENTS_REACT_NATIVE.md`) containing:

1. Executive summary
2. Functional requirements (grouped by feature area)
3. UI/UX specification (screens, components, design tokens)
4. Template specifications (all 48 templates with IDs and behaviors)
5. API specification (endpoints, request/response formats)
6. Data model definitions
7. Non-functional requirements (performance, offline, accessibility)
8. Integration requirements (Clerk, MongoDB, Cloudinary, Liveblocks, Stripe)
9. Android-specific notes (navigation, gestures, back button, notifications)

---

## 3. Key Files to Reference

- [src/lib/models/notebook.ts](src/lib/models/notebook.ts) - Notebook schema
- [src/lib/models/page.ts](src/lib/models/page.ts) - Page schema
- [src/lib/shared-template-config.ts](src/lib/shared-template-config.ts) - JSON template mapping
- [tailwind.config.ts](tailwind.config.ts) - Design tokens
- [src/components/notebook-templates/](src/components/notebook-templates/) - All template implementations
- [src/app/api/](src/app/api/) - API routes
- [public/manifest.json](public/manifest.json) - PWA config

