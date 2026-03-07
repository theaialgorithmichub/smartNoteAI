# 📚 SmartNote AI - API Documentation

## Overview

The SmartNote AI API provides programmatic access to all platform features. Use the API to integrate SmartNote into your applications, automate workflows, and build custom integrations.

**Base URL:** `https://your-domain.com/api/v1`

---

## Authentication

All API requests require authentication using an API key.

### Getting an API Key

1. Log in to your SmartNote account
2. Go to Settings → API Keys
3. Click "Create New API Key"
4. Save the key securely (it's only shown once!)

### Using Your API Key

Include your API key in the request header:

```bash
curl -H "X-API-Key: sk_your_api_key_here" \
  https://your-domain.com/api/v1/notebooks
```

Or use Bearer token:

```bash
curl -H "Authorization: Bearer sk_your_api_key_here" \
  https://your-domain.com/api/v1/notebooks
```

---

## Rate Limits

| Plan | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free | 10 | 1,000 |
| Pro | 60 | 10,000 |
| Ultra | 300 | 100,000 |
| Enterprise | Custom | Custom |

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

---

## Endpoints

### Notebooks

#### List Notebooks
```http
GET /api/v1/notebooks
```

**Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `template` (string): Filter by template type
- `search` (string): Search in titles and content

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "nb_123",
        "title": "My Notebook",
        "template": "document",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-02T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Create Notebook
```http
POST /api/v1/notebooks
```

**Body:**
```json
{
  "title": "My New Notebook",
  "template": "document",
  "content": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "nb_124",
    "title": "My New Notebook",
    "template": "document",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Get Notebook
```http
GET /api/v1/notebooks/{id}
```

#### Update Notebook
```http
PATCH /api/v1/notebooks/{id}
```

**Body:**
```json
{
  "title": "Updated Title",
  "content": {}
}
```

#### Delete Notebook
```http
DELETE /api/v1/notebooks/{id}
```

---

### Templates

#### List Templates
```http
GET /api/v1/templates
```

#### Get Template
```http
GET /api/v1/templates/{id}
```

---

### Analytics

#### Get User Stats
```http
GET /api/v1/analytics/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalNotebooks": 42,
    "totalWords": 15000,
    "totalTimeSpent": 1200,
    "streakDays": 7
  }
}
```

#### Get Activity Timeline
```http
GET /api/v1/analytics/timeline?days=30
```

---

### AI Assistant

#### Get Writing Suggestions
```http
POST /api/v1/ai/suggestions
```

**Body:**
```json
{
  "text": "Your text here"
}
```

#### Generate Content
```http
POST /api/v1/ai/generate
```

**Body:**
```json
{
  "prompt": "Write about AI",
  "tone": "professional",
  "length": "medium"
}
```

---

### Sharing

#### Create Share Link
```http
POST /api/v1/share
```

**Body:**
```json
{
  "notebookId": "nb_123",
  "accessType": "view",
  "password": "optional",
  "expiresIn": 24
}
```

---

## Webhooks

Configure webhooks to receive real-time notifications about events.

### Setting Up Webhooks

1. Go to Settings → Webhooks
2. Click "Add Webhook"
3. Enter your endpoint URL
4. Select events to subscribe to
5. Save webhook

### Webhook Events

- `notebook.created`
- `notebook.updated`
- `notebook.deleted`
- `share.created`
- `template.downloaded`
- `subscription.updated`

### Webhook Payload

```json
{
  "event": "notebook.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "nb_123",
    "title": "New Notebook",
    "userId": "user_456"
  },
  "signature": "sha256_signature"
}
```

### Verifying Webhooks

Verify webhook signatures using your webhook secret:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://your-domain.com/api/v1',
  headers: {
    'X-API-Key': 'sk_your_api_key_here'
  }
});

// List notebooks
const notebooks = await api.get('/notebooks');

// Create notebook
const newNotebook = await api.post('/notebooks', {
  title: 'My Notebook',
  template: 'document'
});
```

### Python

```python
import requests

API_KEY = 'sk_your_api_key_here'
BASE_URL = 'https://your-domain.com/api/v1'

headers = {
    'X-API-Key': API_KEY
}

# List notebooks
response = requests.get(f'{BASE_URL}/notebooks', headers=headers)
notebooks = response.json()

# Create notebook
data = {
    'title': 'My Notebook',
    'template': 'document'
}
response = requests.post(f'{BASE_URL}/notebooks', json=data, headers=headers)
```

### cURL

```bash
# List notebooks
curl -H "X-API-Key: sk_your_api_key_here" \
  https://your-domain.com/api/v1/notebooks

# Create notebook
curl -X POST \
  -H "X-API-Key: sk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Notebook","template":"document"}' \
  https://your-domain.com/api/v1/notebooks
```

---

## Permissions

API keys can have the following permissions:

- `notebooks.read` - Read notebooks
- `notebooks.write` - Create/update notebooks
- `notebooks.delete` - Delete notebooks
- `templates.read` - Read templates
- `templates.write` - Create/update templates
- `analytics.read` - Access analytics
- `share.create` - Create share links
- `share.manage` - Manage share links
- `ai.use` - Use AI features
- `marketplace.read` - Browse marketplace
- `marketplace.write` - Submit templates

---

## Best Practices

1. **Secure Your Keys**: Never commit API keys to version control
2. **Use Environment Variables**: Store keys in environment variables
3. **Implement Retry Logic**: Handle rate limits gracefully
4. **Cache Responses**: Reduce API calls where possible
5. **Monitor Usage**: Track your API usage in the dashboard
6. **Use Webhooks**: For real-time updates instead of polling
7. **Validate Input**: Always validate data before sending
8. **Handle Errors**: Implement proper error handling

---

## Support

- **Documentation**: https://docs.smartnote.ai
- **API Status**: https://status.smartnote.ai
- **Support**: api@smartnote.ai
- **Community**: https://community.smartnote.ai

---

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Notebooks CRUD operations
- Analytics endpoints
- AI assistant integration
- Webhook support
