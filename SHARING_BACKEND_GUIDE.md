# Social Sharing Feature - Backend Implementation Guide

## Overview
This guide provides the complete backend implementation for the social sharing features including friend system, notebook sharing, and notifications.

---

## 📊 MongoDB Schemas

### 1. User Schema (extends Clerk user)
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

### 2. FriendRequest Schema
```javascript
// models/FriendRequest.js
const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Prevent duplicate requests
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
```

### 3. Notebook Schema
```javascript
// models/Notebook.js
const mongoose = require('mongoose');

const notebookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  template: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: mongoose.Schema.Types.Mixed }, // JSON content from localStorage
  
  // Sharing settings
  isPublic: { type: Boolean, default: false },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Metadata
  pageCount: { type: Number, default: 1 },
  category: String,
  tags: [String],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
notebookSchema.index({ owner: 1 });
notebookSchema.index({ isPublic: 1 });
notebookSchema.index({ sharedWith: 1 });

module.exports = mongoose.model('Notebook', notebookSchema);
```

### 4. Notification Schema
```javascript
// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['notebook_shared', 'friend_request', 'friend_accepted'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  
  // Action data
  actionData: {
    notebookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebook' },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'FriendRequest' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

---

## 🔌 API Endpoints

### Authentication Middleware
```javascript
// middleware/auth.js
const { clerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const { userId } = req.auth; // Clerk middleware provides this
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get or create user in MongoDB
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName + ' ' + clerkUser.lastName,
        avatar: clerkUser.profileImageUrl
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = { requireAuth };
```

### Friend System Endpoints

#### 1. Search Users
```javascript
// routes/friends.js
router.get('/api/friends/search', requireAuth, async (req, res) => {
  try {
    const { query } = req.query;
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude self
        { _id: { $nin: req.user.friends } }, // Exclude existing friends
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).limit(20).select('name email avatar');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Send Friend Request
```javascript
router.post('/api/friends/request', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if already friends
    if (req.user.friends.includes(userId)) {
      return res.status(400).json({ error: 'Already friends' });
    }
    
    // Check for existing request
    const existing = await FriendRequest.findOne({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id }
      ]
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Request already exists' });
    }
    
    // Create request
    const request = await FriendRequest.create({
      from: req.user._id,
      to: userId
    });
    
    // Create notification
    const recipient = await User.findById(userId);
    await Notification.create({
      recipient: userId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${req.user.name} sent you a friend request`,
      actionData: { requestId: request._id, userId: req.user._id }
    });
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. Accept Friend Request
```javascript
router.post('/api/friends/accept/:requestId', requireAuth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    
    if (!request || request.to.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Update request status
    request.status = 'accepted';
    await request.save();
    
    // Add to friends list (both users)
    await User.findByIdAndUpdate(request.from, {
      $addToSet: { friends: request.to }
    });
    await User.findByIdAndUpdate(request.to, {
      $addToSet: { friends: request.from }
    });
    
    // Create notification for requester
    await Notification.create({
      recipient: request.from,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${req.user.name} accepted your friend request`,
      actionData: { userId: req.user._id }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 4. Reject Friend Request
```javascript
router.post('/api/friends/reject/:requestId', requireAuth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    
    if (!request || request.to.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    request.status = 'rejected';
    await request.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 5. Get Friends List
```javascript
router.get('/api/friends', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email avatar');
    
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 6. Get Friend Requests
```javascript
router.get('/api/friends/requests', requireAuth, async (req, res) => {
  try {
    const incoming = await FriendRequest.find({
      to: req.user._id,
      status: 'pending'
    }).populate('from', 'name email avatar');
    
    const sent = await FriendRequest.find({
      from: req.user._id,
      status: 'pending'
    }).populate('to', 'name email avatar');
    
    res.json({ incoming, sent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Notebook Sharing Endpoints

#### 1. Share Notebook
```javascript
// routes/notebooks.js
router.post('/api/notebooks/:id/share', requireAuth, async (req, res) => {
  try {
    const { isPublic, sharedWith } = req.body;
    
    const notebook = await Notebook.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Verify all users in sharedWith are friends
    if (sharedWith && sharedWith.length > 0) {
      const validFriends = sharedWith.every(id => 
        req.user.friends.some(friendId => friendId.toString() === id)
      );
      
      if (!validFriends) {
        return res.status(400).json({ error: 'Can only share with friends' });
      }
    }
    
    notebook.isPublic = isPublic;
    notebook.sharedWith = sharedWith || [];
    await notebook.save();
    
    // Create notifications for shared users
    if (sharedWith && sharedWith.length > 0) {
      const notifications = sharedWith.map(userId => ({
        recipient: userId,
        type: 'notebook_shared',
        title: 'Notebook Shared',
        message: `${req.user.name} shared "${notebook.title}" with you`,
        actionData: { notebookId: notebook._id, userId: req.user._id }
      }));
      
      await Notification.insertMany(notifications);
    }
    
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Get Public Notebooks
```javascript
router.get('/api/notebooks/public', requireAuth, async (req, res) => {
  try {
    const notebooks = await Notebook.find({
      isPublic: true,
      owner: { $ne: req.user._id } // Exclude own notebooks
    })
    .populate('owner', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(notebooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. Get Shared Notebooks
```javascript
router.get('/api/notebooks/shared', requireAuth, async (req, res) => {
  try {
    const notebooks = await Notebook.find({
      sharedWith: req.user._id
    })
    .populate('owner', 'name email avatar')
    .sort({ updatedAt: -1 });
    
    res.json(notebooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 4. Create/Update Notebook
```javascript
router.post('/api/notebooks', requireAuth, async (req, res) => {
  try {
    const { title, template, content } = req.body;
    
    const notebook = await Notebook.create({
      title,
      template,
      content,
      owner: req.user._id
    });
    
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/api/notebooks/:id', requireAuth, async (req, res) => {
  try {
    const notebook = await Notebook.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Notification Endpoints

#### 1. Get Notifications
```javascript
// routes/notifications.js
router.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Mark as Read
```javascript
router.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. Mark All as Read
```javascript
router.patch('/api/notifications/read-all', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🚀 Next Steps

### Phase 1: Setup (Completed ✅)
- [x] Create UI components
- [x] Document MongoDB schemas
- [x] Document API endpoints

### Phase 2: Backend Implementation
1. Create API routes folder structure
2. Implement all endpoints
3. Add Clerk middleware
4. Test with Postman/Thunder Client

### Phase 3: Frontend Integration
1. Create API service layer
2. Connect UI components to API
3. Add real-time updates (optional: Socket.io)
4. Test end-to-end flow

### Phase 4: Testing & Deployment
1. Test all features
2. Add error handling
3. Deploy backend
4. Update frontend to use production API

---

## 📝 Environment Variables Needed

```env
# .env
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NODE_ENV=development
PORT=3001
```

---

## 🔧 Installation Commands

```bash
# Install backend dependencies
npm install express mongoose @clerk/clerk-sdk-node cors dotenv

# For Next.js API routes (if using Next.js)
npm install @clerk/nextjs
```

---

Ready to implement! Let me know when you want to proceed with Phase 2 (Backend Implementation).
