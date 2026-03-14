# SmartNote AI – Requirements Document for React Native Android App

**Version:** 1.0  
**Purpose:** Capture all implemented features, styles, and technical specifications of the SmartNote AI web app for building a React Native Android app with identical functionality and visual design.

---

## 1. Executive Summary

SmartNote AI is an AI-powered note-taking platform combining a nostalgic physical notebook experience with generative AI. The product offers 50+ notebook templates (Simple, Meeting Notes, Save the Date, Tutorial Learn, Planner, Diary, etc.), real-time collaboration, sharing, AI assistant (complete, improve, outline, chat, image generation, transcription), workspaces, friends/social, and Stripe-based subscriptions. The Android app must replicate the same styles (brand colors, gradients, paper patterns, dark mode), all screens and navigation, all 48+ templates, and the full API/data model integration (Clerk auth, MongoDB-backed REST APIs, Cloudinary uploads, Liveblocks collaboration, Stripe).

---

## 2. Functional Requirements

### 2.1 Authentication

| Requirement | Description |
|-------------|-------------|
| AUTH-1 | Use Clerk for sign-in, sign-up, and session management. |
| AUTH-2 | Map Clerk `userId` (clerkId) to application User document in backend. |
| AUTH-3 | Support sign-in and sign-up screens (Clerk-hosted or custom UI). |
| AUTH-4 | Persist session and restore on app launch. |

### 2.2 Notebook Management

| ID | Requirement |
|----|-------------|
| NB-1 | Create notebook: title, category (Personal, Work, School, Research), template selection from full template list. |
| NB-2 | Edit notebook: title, category, appearance (cover image URL or theme color, page color, paper pattern, font style). |
| NB-3 | Delete notebook: soft delete; move to trash. |
| NB-4 | Restore notebook from trash. |
| NB-5 | Permanently delete from trash (after soft delete). |
| NB-6 | List notebooks with filter by category: All, Personal, Work, School, Research. |
| NB-7 | Display per notebook: cover (image or gradient), category badge, title, page count, last updated. |

### 2.3 Notebook Appearance

| ID | Requirement |
|----|-------------|
| AP-1 | Cover: optional cover image URL, or gradient using theme color. |
| AP-2 | Theme color: picker with 20+ preset colors (e.g. Leather Brown #8B4513, Navy Blue, Forest Green, Burgundy, Charcoal, Pastel Pink/Blue/Green, Deep Sea, Purple Haze, Sunset Orange, Emerald, Rose Gold, Teal, Indigo, Amber, Cyan, Violet, Coral). |
| AP-3 | Page color: default cream #fffbeb; support dark page colors. |
| AP-4 | Paper pattern: lined, grid, dotted, blank. |
| AP-5 | Font style: sans, serif, handwritten. |

### 2.4 Sharing

| ID | Requirement |
|----|-------------|
| SH-1 | Create share link with access type: view, edit, or comment. |
| SH-2 | Optional password protection. |
| SH-3 | Optional expiry date and max view count. |
| SH-4 | Options: allow download, allow print, custom watermark. |
| SH-5 | Share with friends (via friend list). |
| SH-6 | Revoke sharing (unshare). |
| SH-7 | Public shared view: render notebook in read-only (or edit if access allows) for unauthenticated users via share link. |

### 2.5 Collaboration

| ID | Requirement |
|----|-------------|
| CO-1 | Real-time presence and cursors (Liveblocks). |
| CO-2 | Comments panel on content. |
| CO-3 | @mention in editor for collaborators. |
| CO-4 | Workspaces: create workspace, invite by code; roles: owner, admin, editor, viewer. |
| CO-5 | Workspace contains multiple notebooks; access by role. |

### 2.6 AI Features

| ID | Requirement |
|----|-------------|
| AI-1 | In-editor AI: complete (autocomplete), improve (rewrite), outline, ask (Q&A on selection). |
| AI-2 | Notebook-scoped chat sidebar (context from current notebook). |
| AI-3 | Public/general AI chat (no notebook context). |
| AI-4 | Image generation from prompt. |
| AI-5 | Voice-to-text transcription. |
| AI-6 | Auto-tagging and suggestions. |
| AI-7 | Deep research with sources (research builder style). |

### 2.7 Friends and Social

| ID | Requirement |
|----|-------------|
| FR-1 | Send friend request; accept or reject. |
| FR-2 | Search users (friends search). |
| FR-3 | List friends and use for sharing notebooks. |
| FR-4 | Notifications for friend request and friend accepted. |

### 2.8 Subscriptions and Monetization

| ID | Requirement |
|----|-------------|
| SU-1 | Plans: free, pro, ultra. |
| SU-2 | Stripe checkout for upgrade; manage subscription (portal). |
| SU-3 | Credits system for AI/usage. |
| SU-4 | Template selection limits per plan. |

### 2.9 Other Features

| ID | Requirement |
|----|-------------|
| OT-1 | Favorites: mark templates as favorite. |
| OT-2 | Full-text search across notebooks/pages. |
| OT-3 | Import content (import API). |
| OT-4 | Export (e.g. PDF where applicable). |
| OT-5 | API keys: create keys with scoped permissions and rate limits. |
| OT-6 | Notifications: list, unread count, mark read, types (e.g. notebook_shared, friend_request, friend_accepted). |
| OT-7 | Offline handling: graceful degradation or offline indicator. |
| OT-8 | Trash: list trashed notebooks; 30-day expiry before permanent deletion. |

---

## 3. UI/UX Specification

### 3.1 Design System

- **Semantic colors (HSL-based):** background, foreground, primary, secondary, muted, accent, card, destructive, border, ring, input, popover (with light and dark variants).
- **Border radius:** `lg`, `md`, `sm` derived from `--radius`.
- **Typography:** Support sans, serif, and handwritten font styles; rich text fonts (e.g. Roboto, Playfair Display, Lato, Inter, etc.) where used in web.

### 3.2 Brand Colors

| Token | Light | Usage |
|-------|--------|--------|
| Primary gradient | Amber to orange (`#f59e0b` → `#f97316`) | Logo, primary CTAs |
| Accent | Purple (`#a855f7`, `#e9d5ff`) | AI, secondary actions |
| Leather | `#8B4513`, `#654321`, `#3D2914` | Notebook theme |
| Paper | Cream `#FDF5E6`, White `#FAFAFA`, Aged `#F5E6D3` | Page backgrounds |

### 3.3 Theme

- **Dark mode:** Class-based (e.g. `dark` class on root); support light, dark, and system.
- **Color themes:** Optional data attributes for alternate themes (leather-brown, navy-blue, forest-green, pastels, amber, violet, coral).

### 3.4 Components

| Component | Variants / Notes |
|-----------|------------------|
| Button | default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon |
| Card | Base card (rounded, border, shadow); GlareCard (glare effect on hover/tap) |
| Dialog / Modal | Alert dialog, standard dialog |
| Dropdown / Popover | Menus, tooltips, hover cards |
| Input | Text input, search bar, prompt input (dynamic grow) |
| Loading | Cube loader, skeleton shimmer |

### 3.5 Layout

- **App header:** Sticky; background white/95 or black/95 with backdrop blur; border bottom; logo (gradient text); nav items; user button.
- **Dashboard:** Max width container; padding; grid of notebook cards.
- **Notebook cards:** Cover (image or gradient), category badge (gradient by category), title, page count, last updated; hover/tap actions: Share, Edit cover, Delete.
- **Notebook viewer:** Dedicated header (AI, Share, Chat, theme/page options); content area full height; template-specific layout.

### 3.6 Visual Effects

- **Gradients:** Hero, cards, notebook spines (e.g. left spine shadow).
- **Paper patterns:** Lined, grid, dotted, blank (CSS or equivalent patterns).
- **Motion:** Page flip (e.g. rotateY), accordion expand/collapse, fade/slide for modals; use React Native Animated or Reanimated.
- **Glare:** Optional glare effect on notebook card.

### 3.7 Screens and Routes

| Screen | Route (web) | Purpose |
|--------|-------------|---------|
| Landing | `/` | Hero, features, AI demo; redirect to dashboard if signed in |
| Dashboard | `/dashboard` | Bookshelf, notebook cards, category filters |
| Notebook Viewer | `/dashboard/notebook/[id]` | Full notebook with header and template content |
| Templates Gallery | `/templates` | Template selection and create notebook |
| Search | `/dashboard/search` | Full-text and AI search |
| Settings | `/dashboard/settings` | App preferences |
| Trash | `/dashboard/trash` | Soft-deleted notebooks |
| Shared View | `/share/[shareId]` | Public shared notebook (read-only or by access) |
| Workspaces | `/dashboard/workspaces` | Workspace list and management |
| Account | `/account` | Profile and subscription |
| Pricing | `/pricing` | Plans (free/pro/ultra) |
| Analytics | `/analytics` | User stats, streaks, insights |
| Marketplace | `/marketplace` | Community templates |
| Admin | `/admin`, `/admin/dashboard` | Admin-only tools |
| Sign-in / Sign-up | `/sign-in`, `/sign-up` | Clerk auth |

---

## 4. Template Specifications

### 4.1 Storage Patterns

- **Page-based (HTML):** Content stored in standard Page documents; `content` is HTML. Used by: simple, meeting-notes, journal, custom, doodle, story, storytelling, typewriter, n8n, image-prompt, video-prompt, link, flashcard, recipe, expense, todo, sound-box, book-notes, habit-tracker, workout-log, budget-planner, class-notes, research-builder, grocery-list, expense-sharer, project-pipeline, important-urls, language-translator, dictionary, meals-planner, games-scorecard, sticker-book, mind-map, goal-tracker, ai-prompt-studio, piano-notes, vocabulary.
- **JSON-backed:** One dedicated page per notebook with a fixed title; `content` is JSON. Used by: save-the-date, tutorial-learn, planner, diary, document, dashboard, trip, loop, project, prompt-diary, ai-research, code-notebook, whiteboard, studybook. Page titles: `__save_the_date_template__`, `__tutorial_learn_template__`, `__planner_template__`, etc.

### 4.2 Template List (48 Templates)

| ID | Name | Key Features |
|----|------|--------------|
| simple | Simple Notebook | Page flipping, rich text editor, AI assistance |
| meeting-notes | Meeting Notes | Scratch pad, pinned notes, written notes |
| document | Document | Multiple tabs, charts, overview sections |
| dashboard | Dashboard | Notes, calendar, task management |
| code-notebook | Code Notebook | Code blocks, syntax highlighting, output |
| planner | Planner | Context, goals, timed agenda |
| ai-research | AI Research | Source management, AI chat, notes, deep research |
| diary | Diary | Daily entries, mood tracking, calendar |
| journal | Journal | Prompts, reflection, gratitude log |
| custom | Custom Pages | Custom page layout |
| doodle | Doodle | Drawing tools, color palette, layers |
| project | Project | Tasks, timeline, milestones |
| loop | Loop | Real-time sync, comments, mentions |
| story | Story | Chapters, character profiles, plot outline |
| storytelling | Storytelling | Story studio features |
| typewriter | Typewriter | Focus mode, typewriter sounds, word count |
| n8n | n8n Workflows | Workflow integration |
| image-prompt | Image Prompts | Image prompt templates |
| video-prompt | Video Prompts | Video prompt templates |
| link | Link Collection | Categories, tags, quick access |
| studybook | Study Book | Summaries, key concepts, review mode |
| flashcard | Flashcards | Study mode, spaced repetition |
| whiteboard | Whiteboard | Infinite canvas, shapes, sticky notes |
| recipe | Recipe Book | Ingredients, step-by-step, cook timer |
| expense | Expense Tracker | Logging, categories, budget, reports |
| trip | Trip Planner | Itinerary, packing list, budget |
| todo | Todo List | Priorities, deadlines, completion |
| sound-box | Sound Box | Voice-to-text, multi-language |
| book-notes | Book Reading Notes | Book tracker, chapter notes, quotes |
| habit-tracker | Habit Tracker | Daily tracking, streaks, progress |
| workout-log | Workout Log | Exercise library, sets/reps, plans |
| budget-planner | Budget Planner | Income/expenses, savings goals |
| class-notes | Class Notes | Subjects, lectures, assignments |
| research-builder | Research Builder | AI content, chapter planning |
| grocery-list | Grocery List | Categories, check-off, quantities |
| expense-sharer | Expense Sharer | Participants, auto-split, settlement |
| project-pipeline | Project Pipeline | Kanban, stages, progress |
| prompt-diary | Prompt Diary | Prompt library, categories, search |
| save-the-date | Save the Date | Events, reminders, countdown, URLs |
| important-urls | Important URLs | YouTube/Instagram/Reels bookmarks |
| language-translator | Language Translator | Voice/text, multi-language |
| dictionary | Dictionary | Word lookup, definitions |
| meals-planner | Meals Planner | Menu, orders, table management |
| games-scorecard | Games Scorecard | Matches, scores, leaderboard |
| sticker-book | Sticker Book | Sticky notes, drag & drop, colors |
| tutorial-learn | Tutorial Learn | Steps, sections, images, PDF export |
| mind-map | Mind Map | Nodes, hierarchy, JSON export |
| goal-tracker | Goal Tracker | SMART goals, milestones, progress |
| ai-prompt-studio | AI Prompt Studio | Version control, multi-model, metrics |
| piano-notes | Piano Notes | Repertoire, practice log, technique |
| vocabulary | Vocabulary | Word lists, definitions, tags |

### 4.3 Notable Template Behaviors

- **Save the Date:** Events array (title, date, time, url, reminder, category); countdown badges (today, days left, past); upcoming alerts (3-day window); animated card stack for upcoming events with URL preview; filter/search; edit/delete event.
- **Tutorial Learn:** Projects with steps and sections; section text and imageUrls; PDF export; read-only shared view with initial data.
- **Simple:** Page flip animation; Quill/Tiptap-style rich text; AI toolbar (complete, improve, outline, ask).
- **Planner:** Agenda items, goals, day notes; mini calendar; context panel.
- **Doodle:** Drawing canvas, layers, color palette.

---

## 5. API Specification

### 5.1 Base

- **Base URL:** Same as web (configurable; e.g. `https://<domain>/api`).
- **Auth:** Clerk session; send session token or cookies per existing web API behavior.
- **Format:** JSON request/response unless FormData (e.g. upload).

### 5.2 Notebooks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notebooks` | List user notebooks (query: category, etc.) |
| POST | `/api/notebooks` | Create notebook (body: title, category, template, appearance?) |
| GET | `/api/notebooks/[id]` | Get single notebook |
| PATCH | `/api/notebooks/[id]` | Update notebook (title, category, appearance, tags) |
| DELETE | `/api/notebooks/[id]` | Soft delete (move to trash) |
| GET | `/api/notebooks/[id]/pages` | List pages |
| POST | `/api/notebooks/[id]/pages` | Create page (title, content?) |
| GET | `/api/notebooks/[id]/pages/[pageId]` | Get page |
| PATCH | `/api/notebooks/[id]/pages/[pageId]` | Update page (title, content) |
| DELETE | `/api/notebooks/[id]/pages/[pageId]` | Delete page |
| GET | `/api/notebooks/[id]/chapters` | List chapters |
| POST | `/api/notebooks/[id]/chapters` | Create chapter |
| POST | `/api/notebooks/[id]/restore` | Restore from trash |
| DELETE | `/api/notebooks/[id]/permanent` | Permanent delete |
| GET | `/api/notebooks/trash` | List trashed notebooks |
| POST | `/api/notebooks/[id]/share` | Create share / share with friends |
| POST | `/api/notebooks/[id]/unshare` | Unshare |
| GET | `/api/notebooks/shared` | List shared-with-me |
| GET | `/api/notebooks/shared-by-me` | List shared-by-me |
| GET | `/api/notebooks/public` | List public notebooks |

### 5.3 Share (Public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/share/[shareId]` | Validate share; optional query `password` |
| GET | `/api/share/[shareId]/notebook` | Get notebook + pages for share (no auth) |
| POST | `/api/share/create` | Create share link |
| GET | `/api/share/list` | List user's share links |
| PATCH/DELETE | `/api/share/[shareId]` | Update or delete share |

### 5.4 Upload

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | FormData: `file`, `type` ("cover" \| "attachment"). Returns `{ url, publicId }`. |

### 5.5 AI

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/complete` | Autocomplete |
| POST | `/api/ai/improve` | Improve/rewrite text |
| POST | `/api/ai/outline` | Generate outline |
| POST | `/api/ai/ask` | Ask (Q&A) |
| POST | `/api/ai/transcribe` | Voice-to-text |
| POST | `/api/ai/generate-image` | Image generation |
| POST | `/api/ai/suggestions` | Suggestions |
| POST | `/api/ai/auto-tag` | Auto-tagging |
| POST | `/api/research` | Deep research |
| POST | `/api/chat` | Notebook chat |
| POST | `/api/chat/public` | Public chat |

### 5.6 Friends

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/friends` | List friends |
| POST | `/api/friends/request` | Send friend request |
| GET | `/api/friends/requests` | List pending requests |
| POST | `/api/friends/accept/[requestId]` | Accept request |
| POST | `/api/friends/reject/[requestId]` | Reject request |
| GET | `/api/friends/search` | Search users |

### 5.7 Workspaces

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspaces` | List workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/[id]` | Get workspace |
| PATCH | `/api/workspaces/[id]` | Update workspace |
| DELETE | `/api/workspaces/[id]` | Delete workspace |
| POST | `/api/workspaces/join` | Join by invite code |

### 5.8 Subscription

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subscription/status` | Current plan, credits |
| POST | `/api/subscription/create-checkout` | Stripe checkout |
| POST | `/api/subscription/manage` | Customer portal |
| GET/POST | `/api/subscription/select-templates` | Template selection |

### 5.9 Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PATCH | `/api/notifications/read-all` | Mark all read |
| PATCH | `/api/notifications/[id]/read` | Mark one read |

### 5.10 Other

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search` | Full-text search |
| POST | `/api/import` | Import content |
| GET | `/api/favorites` | List favorites |
| POST | `/api/favorites` | Add favorite |
| DELETE | `/api/favorites` | Remove favorite |
| POST | `/api/liveblocks-auth` | Liveblocks auth for collaboration |
| GET/POST/DELETE | `/api/v1/keys` | API key management |
| GET | `/api/analytics/stats`, `/api/analytics/insights`, `/api/analytics/timeline` | Analytics |
| Marketplace | `/api/marketplace/templates`, `/api/marketplace/[templateId]`, review, download | Marketplace |

---

## 6. Data Model Definitions

### 6.1 Notebook

- `_id`, `userId`, `title`, `category`, `template`, `appearance` (coverImageUrl?, themeColor, pageColor, paperPattern, fontStyle), `tags[]`, `isTrashed`, `trashedAt?`, `isPublic`, `sharedWith[]`, `content?`, `pageCount`, `createdAt`, `updatedAt`.

### 6.2 Page

- `_id`, `notebookId`, `chapterId?`, `pageNumber`, `title`, `content` (HTML or string for JSON templates), `contentPlainText?`, `vector?` (RAG), `attachments?`, `tags?`, timestamps.

### 6.3 Chapter

- `_id`, `notebookId`, `title`, `orderIndex`, `color`.

### 6.4 Share

- `_id`, `notebookId`, `userId`, `shareId`, `accessType` (view/edit/comment), `password?`, `expiresAt?`, `maxViews?`, `currentViews`, `allowDownload`, `allowPrint`, `watermark?`, `accessLog?`, timestamps.

### 6.5 User

- `_id`, `clerkId`, `email`, `name`, `avatar`, `isAdmin`, `friends[]`, timestamps.

### 6.6 Workspace

- `_id`, `name`, `ownerId`, `members[]` (userId, role), `notebookIds[]`, `inviteCode`, `isPublic`, timestamps.

### 6.7 FriendRequest

- `_id`, `from`, `to`, `status` (pending/accepted/rejected), timestamps.

### 6.8 Notification

- `_id`, `recipient`, `type`, `title`, `message`, `read`, `actionData?`, timestamps.

### 6.9 Subscription

- `_id`, `userId`, `planType`, `billingCycle`, Stripe IDs, `credits`, `selectedTemplates`, `status`, timestamps.

### 6.10 Others

- Favorite (userId, templateId), MarketplaceTemplate, TemplateReview, APIKey, AnalyticsEvent, Transaction, etc. (see backend models).

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Performance:** List and open notebooks with acceptable latency; lazy-load template content where appropriate. |
| NFR-2 | **Offline:** Handle network errors gracefully; show offline indicator; optionally cache recent notebooks/pages for read-only offline (future). |
| NFR-3 | **Accessibility:** Support screen readers, sufficient contrast, scalable text where applicable. |
| NFR-4 | **Security:** Auth token stored securely; use HTTPS for all API calls. |
| NFR-5 | **Compatibility:** Target Android API level per project policy (e.g. 21+ or 24+). |

---

## 8. Integration Requirements

| Service | Purpose | Mobile Consideration |
|---------|---------|----------------------|
| **Clerk** | Auth (sign-in, sign-up, session) | Use Clerk React Native SDK; same backend user sync (clerkId → User). |
| **MongoDB** | All app data | No direct connection; use existing REST APIs only. |
| **Cloudinary** | Image upload (cover, attachments) | Same upload API; ensure FormData and file handling work from device. |
| **Liveblocks** | Real-time collaboration | Use Liveblocks React Native or compatible client; same auth endpoint. |
| **Stripe** | Payments | Use Stripe React Native SDK; same backend checkout/session endpoints. |

---

## 9. Android-Specific Notes

| Topic | Requirement |
|-------|-------------|
| **Navigation** | Stack navigation for screens; bottom tab or drawer for main areas (Dashboard, Templates, Search, Account) as per UX choice. |
| **Back button** | Handle hardware back: exit notebook to dashboard, close modals, or exit app per Android guidelines. |
| **Gestures** | Swipe for page flip (simple template) or list actions where applicable. |
| **Notifications** | Push notifications for friend requests, shared notebook, and other notification types; use FCM and link to app deep links. |
| **Deep links** | Support share link opening in app (e.g. `smartnote://share/[shareId]`) and optional universal links. |
| **Theme** | Respect system dark/light; support in-app theme toggle. |
| **Icons** | Use same icon set (e.g. Lucide) and PWA icon sizes (72–512) for launcher and notifications. |
| **Manifest** | App name: SmartNote AI; short_name: SmartNote; categories: productivity, education, business. |

---

*End of document.*
