# SmartNote AI User Guide

Prepared from the deployed site at `https://smartnoteai-ashen.vercel.app/` and the latest remote branch, `origin/master`, verified on 2026-05-14.

## 1. Product Overview

SmartNote AI is a browser-based digital notebook workspace. It combines a visual bookshelf, physical notebook-style page navigation, AI writing assistance, search, templates, sharing, collaboration, and subscription-based template access.

The product is useful for:

- Students organizing class notes, study material, flashcards, and vocabulary.
- Professionals managing meetings, projects, research, documents, dashboards, and workspaces.
- Creators writing stories, scripts, prompts, journals, and visual boards.
- Teams sharing notebooks, collaborating in real time, and managing workspaces.

## 2. Main Navigation

Public navigation includes:

- Home
- Templates
- Features
- Pricing
- Contact
- Sign in / Sign up

When a user is signed in, the home page redirects to the dashboard.

## 3. Account Access

### Sign up

1. Open the application.
2. Select "Get Started Free" or "Sign Up".
3. Create an account through Clerk authentication.
4. After registration, the user is routed into the app dashboard.

### Sign in

1. Open "Sign in".
2. Authenticate through Clerk.
3. After sign-in, the app opens the dashboard.

### Account and profile management

Users can manage profile/security details through the settings area and subscription details through the account page.

## 4. Dashboard and Bookshelf

The dashboard is the main workspace after login.

Key dashboard functions:

- View notebooks in a visual bookshelf layout.
- Create a new notebook.
- Filter notebooks by category.
- Open recent notebooks from a bottom dock.
- Access shared notebooks, friends, and notifications.
- Clear all notebooks when notebooks exist.

Primary dashboard tabs:

- My Notebooks - personal notebook library.
- Shared - notebooks shared with the user and public notebooks.
- Friends - friend list and friend request management.
- Notifications - share and collaboration notifications.

## 5. Creating a Notebook

To create a notebook:

1. Open the dashboard.
2. Click the create notebook card.
3. Enter a notebook title.
4. Select a category: Personal, Work, School, or Research.
5. Select a template.
6. Choose visual settings such as cover theme, page color, and paper pattern.
7. Optionally upload a cover image.
8. Create the notebook.

Available appearance options include:

- Cover theme colors such as Leather Brown, Navy Blue, Forest Green, Burgundy, Charcoal, Pastel colors, Deep Sea, Purple Haze, Emerald, Teal, Amber, Cyan, Violet, and more.
- Page colors including cream, white, light colors, dark colors, and black.
- Paper styles: lined, grid, dotted, and blank.

## 6. Notebook Editor

Inside a notebook, users can:

- Navigate pages.
- Add pages.
- Use chapter tabs.
- View a table of contents.
- Edit page content.
- Use rich text editing.
- Use AI writing tools.
- Open contextual notebook chat.
- Share the notebook.
- Collaborate with other users where enabled.

Notebook UI features include:

- Physical notebook-inspired layout.
- Page navigation controls.
- Page scrubber.
- Theme controls.
- Notebook header actions for AI, sharing, chat, and user controls.

## 7. Rich Text and Content Editing

The app includes a rich editor for notebook pages.

Supported editing capabilities include:

- Formatted text.
- Page content editing.
- Auto-save style workflows.
- Image and visual content support in relevant flows.
- Voice transcription support through AI transcription endpoints.

## 8. AI Features

SmartNote AI includes multiple AI assistance surfaces.

### AI writing toolbar

The AI assistant can work on selected text or full page content.

Actions include:

- Improve writing.
- Summarize.
- Expand.
- Check grammar.
- Translate.
- Generate outline.
- Auto-tag content.

### Notebook-aware chat

The notebook chat sidebar lets users ask questions in context of notebook content.

### Dashboard AI search and ask

The dashboard search area supports:

- Text search across notebooks.
- AI "ask" style queries over notebook content.

### Other AI capabilities present in the system

The codebase includes APIs for:

- Text generation.
- Text completion.
- Suggestions.
- Image generation.
- Voice transcription.
- Research workflows.
- AI prompt studio.
- Auto-tagging.

## 9. Search

Search options include:

- Dashboard search.
- Dedicated dashboard search results page.
- Reusable global search component.
- AI-powered question answering over notebook content.

Typical use:

1. Open dashboard search.
2. Enter a keyword or question.
3. Choose search or AI ask mode where available.
4. Open the relevant notebook/page from the results.

## 10. Templates

SmartNote AI includes a large template library. Templates can be previewed from the public Templates page and selected when creating notebooks.

### Core and productivity templates

- Simple Notebook
- Meeting Notes
- Document
- Dashboard
- Code Notebook
- Planner
- AI Research
- Diary
- Journal
- Custom Page
- Doodle
- Project Hub
- Loop Workspace
- Story Workshop
- Storytelling Studio
- Typewriter
- n8n Workflows
- Image Prompts
- Video Prompts
- Link Manager
- Study Book
- Flashcards
- Whiteboard
- Recipe Book
- Expense Manager
- Trip Planner
- Advanced To-Do

### Lifestyle, learning, and planning templates

- Sound Box
- Book Reading Notes
- Habit Tracker
- Workout Log
- Budget Planner
- Class Notes
- Research Builder
- Grocery List
- Expense Sharer
- Project Pipeline
- Prompt Diary
- Save the Date
- Important URLs
- Language Translator
- Dictionary
- Meals Planner
- Games Scorecard
- Sticker Book
- Tutorial Learn
- Mind Map
- Goal Tracker
- Piano Notes
- Vocabulary

### Next-generation AI templates

- AI Prompt Studio
- Project Builder
- Second Brain Daily Log
- Narrative Storyboard
- Piano Virtuoso
- Dev-Flow Architect
- Cinematic Storyboarder
- Meeting Strategist
- Research Synthesizer
- Workflow Automator
- Stock Pulse
- Language Bridge
- Smart Carrom Coach

## 11. Template Marketplace

The marketplace is for discovering community-created templates.

Marketplace capabilities:

- Browse templates.
- View featured templates.
- Search templates.
- Filter by category: All Templates, Productivity, Creative, Business, Education, Personal.
- Sort by Most Popular, Highest Rated, Newest, or Trending.
- Switch between grid and list views.
- Open template detail pages.
- Download templates where allowed.
- Submit a template.
- Review templates through marketplace review APIs.

## 12. Sharing and Collaboration

Sharing features include:

- Share notebooks through links.
- Password-protected shared notebooks.
- Optional download and print permissions.
- Public shared notebook viewer.
- Shared notebook rendering for supported templates.
- In-app share management.
- Shared-with-me and shared-by-me flows.

Collaboration features include:

- Friends and friend requests.
- Notifications.
- Liveblocks-powered presence.
- Live cursors.
- Collaborator presence indicators.
- Comments panel.

## 13. Team Workspaces

Team workspaces allow collaboration around groups of notebooks.

Workspace capabilities:

- Create a workspace.
- Join a workspace with an invite code.
- Copy invite code or invite link.
- Assign member roles: owner, admin, editor, viewer.
- Remove members.
- Track notebooks associated with a workspace.
- Delete a workspace.

## 14. Trash and Recovery

The trash area supports notebook recovery workflows.

Capabilities:

- View trashed notebooks.
- Restore notebooks.
- Permanently delete notebooks.
- Follow a 30-day recovery model according to app copy.

## 15. Pricing and Credits

The public pricing page shows launch pricing and credits.

### Free

- Price: $0 forever.
- Includes 1 notebook.
- Basic templates only.
- Community support.
- Premium templates can be purchased with credits.

### Pro

- Price shown: $9.99 per month.
- Up to 10 notebooks.
- Choose 10 templates.
- 50 bonus credits per month.
- Priority support.
- Advanced features.
- Export to PDF.

### Ultra

- Price shown: $19.99 per month.
- Unlimited notebooks.
- All templates included.
- 150 bonus credits per month.
- Premium support.
- All advanced features.
- Priority AI processing.
- Custom branding.
- Team collaboration.

### Credits

Users can buy credit packages to unlock premium templates. Packages shown include 10, 25, 50, 115, and 300 credit options.

## 16. Contact and Feedback

The Contact page lets users submit:

- Glitches.
- Feature ideas.
- Improvements.

Signed-in users can track feedback status.

## 17. Admin Area

Admin routes exist for internal management. Admin users can access:

- Admin dashboard.
- User management.
- Template management.
- Notebook template management.
- Feedback management.
- User sync utilities.

Admin access should only be used by authorized operators.

## 18. Developer/API Features

The codebase includes versioned API-key based notebook APIs:

- `/api/v1/notebooks`
- `/api/v1/keys`

This suggests support for external integrations or developer access.

## 19. Known User Notes

- The product name appears as both "SmartNote AI" and "SmartNotes" in parts of the UI. Documentation and branding should standardize this.
- Some features depend on subscription tier and enabled templates.
- Some AI capabilities require backend API keys and services to be configured.
- Some import/export capabilities exist in the codebase, but the visible entry point should be verified before presenting them as primary user-facing features.
