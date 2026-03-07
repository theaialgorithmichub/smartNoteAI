# 📦 Phase 1 Features - Installation Guide

This guide will help you install and configure all Phase 1 features for SmartNote AI.

---

## 🎯 Phase 1 Features Overview

1. ✅ **Enhanced PDF Export** - Professional PDF generation with custom styling
2. ✅ **Sharing System** - Secure share links with password protection
3. ✅ **Import Functionality** - Import from Markdown, Word, and Text files
4. ✅ **Template Favorites** - Save and organize favorite templates
5. ✅ **Share Management UI** - Complete interface for managing shares

---

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database connection
- Clerk authentication set up
- Existing SmartNote AI project

---

## 🔧 Installation Steps

### Step 1: Install Required Dependencies

```bash
# PDF Export dependencies
npm install jspdf html2canvas

# Sharing System dependencies
npm install nanoid bcryptjs
npm install --save-dev @types/bcryptjs

# Import functionality dependencies
npm install mammoth marked

# Type definitions
npm install --save-dev @types/marked
```

### Step 2: Verify MongoDB Connection

Ensure your MongoDB connection file exists at `src/lib/mongodb.ts`. If not, create it:

```typescript
// src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

### Step 3: Update Environment Variables

Add to your `.env` file:

```env
# MongoDB (if not already added)
MONGODB_URI=your_mongodb_connection_string

# App URL for share links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Add Global Type Definitions

Create or update `global.d.ts` in your project root:

```typescript
// global.d.ts
declare global {
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
}

export {};
```

---

## 🚀 Feature Usage

### 1. PDF Export

```typescript
import { PDFExporter, exportNotebookToPDF } from '@/lib/pdf-export';

// Simple export
await exportNotebookToPDF('My Notebook', content, {
  author: 'John Doe',
  watermark: 'Confidential',
  includePageNumbers: true,
});

// Advanced usage
const exporter = new PDFExporter({
  title: 'My Report',
  orientation: 'landscape',
  fontSize: 14,
});

exporter.addHeading('Chapter 1', 1);
exporter.addText('Content here...');
exporter.addTable(['Name', 'Value'], [['Item 1', '100']]);
exporter.save('report.pdf');
```

### 2. Sharing System

```typescript
// In your component
import { ShareManager } from '@/components/share/share-manager';

function MyComponent() {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <Button onClick={() => setShowShare(true)}>Share</Button>
      <ShareManager
        notebookId={notebookId}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </>
  );
}
```

### 3. Import Functionality

```typescript
// In your component
import { ImportDialog } from '@/components/import/import-dialog';

function MyComponent() {
  const [showImport, setShowImport] = useState(false);

  const handleImportSuccess = (notebook) => {
    console.log('Imported:', notebook);
    // Redirect or refresh
  };

  return (
    <>
      <Button onClick={() => setShowImport(true)}>Import</Button>
      <ImportDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
}
```

### 4. Template Favorites

```typescript
// In your component
import { useFavorites } from '@/hooks/use-favorites';

function TemplateCard({ templateId }) {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <button onClick={() => toggleFavorite(templateId)}>
      {isFavorite(templateId) ? '⭐ Favorited' : '☆ Add to Favorites'}
    </button>
  );
}
```

---

## 📁 Files Created

### Database Models
- `src/lib/models/share.ts` - Share link schema
- `src/lib/models/favorite.ts` - Template favorites schema

### Libraries
- `src/lib/pdf-export.ts` - PDF generation utilities
- `src/lib/import-parser.ts` - File import parsers

### API Routes
- `src/app/api/share/create/route.ts` - Create share links
- `src/app/api/share/[shareId]/route.ts` - Access/manage shares
- `src/app/api/share/list/route.ts` - List user shares
- `src/app/api/import/route.ts` - Import files
- `src/app/api/favorites/route.ts` - Manage favorites

### Components
- `src/components/share/share-manager.tsx` - Share management UI
- `src/components/import/import-dialog.tsx` - Import dialog UI

### Pages
- `src/app/share/[shareId]/page.tsx` - Public share viewer

### Hooks
- `src/hooks/use-favorites.ts` - Favorites management hook

---

## 🧪 Testing

### Test PDF Export
```typescript
// Create a test PDF
const exporter = new PDFExporter({ title: 'Test' });
exporter.addHeading('Test Heading');
exporter.addText('Test content');
exporter.save('test.pdf');
```

### Test Share Links
1. Go to any notebook
2. Click "Share" button
3. Create a share link
4. Copy the link and open in incognito window
5. Verify access controls work

### Test Import
1. Create a test Markdown file:
```markdown
# My Document

This is a test document.

## Section 1
Content here...
```
2. Use Import dialog to upload
3. Verify notebook is created

### Test Favorites
1. Go to templates page
2. Click star icon on any template
3. Refresh page
4. Verify template is still favorited

---

## 🔒 Security Considerations

1. **Share Links**: Use strong, unique IDs (nanoid)
2. **Passwords**: Always bcrypt hashed
3. **File Uploads**: Validate file types and sizes
4. **MongoDB**: Use indexes for performance
5. **API Routes**: Always check authentication

---

## 🐛 Troubleshooting

### PDF Export Issues
- **Error: jsPDF not found**
  ```bash
  npm install jspdf html2canvas
  ```

### Share Link Issues
- **Error: bcryptjs not found**
  ```bash
  npm install bcryptjs @types/bcryptjs
  ```

### Import Issues
- **Error: mammoth not found**
  ```bash
  npm install mammoth marked
  ```

### MongoDB Connection Issues
- Verify `MONGODB_URI` in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions

---

## 📊 Database Indexes

The following indexes are automatically created:

```javascript
// Share model
{ shareId: 1 } // unique
{ userId: 1, notebookId: 1 }
{ expiresAt: 1 } // TTL index

// Favorite model
{ userId: 1, templateId: 1 } // unique compound

```

---

## 🎨 Customization

### PDF Styling
Edit `src/lib/pdf-export.ts`:
- Change default fonts
- Modify header/footer colors
- Adjust margins and spacing

### Share Link Expiration
Default TTL is set in MongoDB schema. Modify in `src/lib/models/share.ts`:
```typescript
ShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Import File Size Limit
Modify in `src/lib/import-parser.ts`:
```typescript
const maxSize = 10 * 1024 * 1024; // 10MB
```

---

## ✅ Verification Checklist

- [ ] All dependencies installed
- [ ] MongoDB connection working
- [ ] Environment variables set
- [ ] PDF export generates files
- [ ] Share links accessible
- [ ] Import accepts files
- [ ] Favorites persist across sessions
- [ ] All API routes return 200
- [ ] No TypeScript errors
- [ ] Database indexes created

---

## 🚀 Next Steps

After completing Phase 1:
1. Test all features thoroughly
2. Deploy to staging environment
3. Gather user feedback
4. Proceed to Phase 2 (AI features, mobile apps, analytics)

---

## 📞 Support

For issues:
1. Check console for errors
2. Verify all dependencies installed
3. Check MongoDB connection
4. Review API route logs
5. Check browser network tab

---

**Phase 1 Complete! 🎉**

You now have:
- ✅ Professional PDF exports
- ✅ Secure sharing system
- ✅ File import capabilities
- ✅ Template favorites
- ✅ Complete share management

Ready for Phase 2!
