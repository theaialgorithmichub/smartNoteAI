# SmartNote AI - Digital Notebook Edition

A knowledge management platform that combines the nostalgic feel of physical notebooks with the power of Generative AI. Unlike standard list-based apps, this application treats workspaces as Digital Notebooks sitting on a virtual shelf.

## Features

### 📚 Digital Bookshelf Dashboard
- Visual bookshelf with 3D notebook covers
- Custom cover images or color themes (Leather, Pastel, Dark)
- Filter notebooks by category/tags
- Quick search across all notebooks

### 📖 Realistic Notebook Experience
- **Page-flip animation** using react-pageflip for realistic page turning
- **Paper styles**: Lined, Grid, Dotted, or Blank backgrounds
- **Chapters**: Organize content with colored sticky tabs
- **Table of Contents**: Auto-generated with page links

### ✏️ Rich Text Editor
- Powered by Tiptap with full formatting support
- Drag & drop images (uploaded to Cloudinary)
- Auto-save with debouncing
- View/Edit mode switching for smooth page flips

### 🔍 Smart Search
- Global search with Cmd+K shortcut
- Fuzzy matching (finds text even with typos)
- Results show notebook, page number, and snippet
- Click to navigate directly to the page

### 🤖 AI Research Companion
- **Chat with Notebook**: RAG-powered Q&A based on notebook content
- **Research Agent**: Browse the web using Tavily AI, summarize findings
- Source citations with page references

### 🗑️ Trash & Recovery
- Soft delete with 30-day recovery window
- Restore or permanently delete notebooks

### 📱 Mobile Responsive
- Vertical scroll mode on screens < 768px
- Maintains paper theme and aesthetics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: ShadCN UI, Radix UI
- **Page Animation**: react-pageflip
- **Rich Text**: Tiptap
- **Authentication**: Clerk
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **AI**: OpenAI GPT-4o + Embeddings
- **Web Search**: Tavily AI

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Clerk account
- Cloudinary account
- OpenAI API key
- Tavily API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smartnote-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartnote

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=sk-xxx

# Tavily AI (Web Research)
TAVILY_API_KEY=tvly-xxx
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## MongoDB Atlas Search Index

For full-text search, create an Atlas Search index on the `pages` collection:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "contentPlainText": {
        "type": "string",
        "analyzer": "lucene.standard"
      }
    }
  }
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/           # RAG chat endpoint
│   │   ├── notebooks/      # CRUD for notebooks, pages, chapters
│   │   ├── research/       # Web research endpoint
│   │   ├── search/         # Global search endpoint
│   │   └── upload/         # Cloudinary upload
│   ├── dashboard/
│   │   ├── notebook/[id]/  # Notebook viewer
│   │   ├── settings/       # User settings
│   │   └── trash/          # Trash management
│   ├── sign-in/
│   └── sign-up/
├── components/
│   ├── bookshelf/          # Bookshelf dashboard components
│   ├── notebook/           # Notebook viewer components
│   ├── search/             # Global search modal
│   ├── trash/              # Trash list
│   └── ui/                 # ShadCN UI components
└── lib/
    ├── models/             # Mongoose schemas
    ├── db.ts               # Database connection
    └── utils.ts            # Utility functions
```

## Database Schema

### Notebooks Collection
```javascript
{
  userId: String,
  title: String,
  category: String,
  appearance: {
    coverImageUrl: String,
    themeColor: String,
    paperPattern: "lined" | "grid" | "dotted" | "blank",
    fontStyle: "sans" | "serif" | "handwritten"
  },
  tags: [String],
  isTrashed: Boolean,
  trashedAt: Date
}
```

### Chapters Collection
```javascript
{
  notebookId: ObjectId,
  title: String,
  orderIndex: Number,
  color: String
}
```

### Pages Collection
```javascript
{
  notebookId: ObjectId,
  chapterId: ObjectId,
  pageNumber: Number,
  title: String,
  content: String,        // HTML from Tiptap
  contentPlainText: String, // For search
  vector: [Number],       // For AI embeddings
  attachments: [{
    url: String,
    type: "image" | "file",
    name: String
  }],
  tags: [String]
}
```

## License

MIT License - see LICENSE file for details.
