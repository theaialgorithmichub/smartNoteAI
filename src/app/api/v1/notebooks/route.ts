import { NextRequest } from 'next/server';
import { validateAPIKey, hasPermission, createAPIResponse, createAPIError } from '@/middleware/api-auth';
import connectDB from '@/lib/mongodb';

/**
 * @swagger
 * /api/v1/notebooks:
 *   get:
 *     summary: List all notebooks
 *     tags: [Notebooks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: template
 *         schema:
 *           type: string
 *         description: Filter by template type
 *     responses:
 *       200:
 *         description: List of notebooks
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
  const auth = await validateAPIKey(req);
  
  if (!auth.valid) {
    return createAPIError(auth.error || 'Unauthorized', 401);
  }

  if (!hasPermission(auth.permissions!, 'notebooks.read')) {
    return createAPIError('Insufficient permissions', 403);
  }

  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const template = searchParams.get('template');

    // Mock response - replace with actual database query
    const notebooks = {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };

    return createAPIResponse(notebooks);
  } catch (error: any) {
    return createAPIError(error.message, 500);
  }
}

/**
 * @swagger
 * /api/v1/notebooks:
 *   post:
 *     summary: Create a new notebook
 *     tags: [Notebooks]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               template:
 *                 type: string
 *               content:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notebook created
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
  const auth = await validateAPIKey(req);
  
  if (!auth.valid) {
    return createAPIError(auth.error || 'Unauthorized', 401);
  }

  if (!hasPermission(auth.permissions!, 'notebooks.write')) {
    return createAPIError('Insufficient permissions', 403);
  }

  try {
    const body = await req.json();
    const { title, template, content } = body;

    if (!title || !template) {
      return createAPIError('Title and template are required', 400);
    }

    await connectDB();

    // Mock response - replace with actual database creation
    const notebook = {
      id: 'nb_' + Date.now(),
      title,
      template,
      content,
      userId: auth.userId,
      createdAt: new Date().toISOString(),
    };

    return createAPIResponse(notebook, 201);
  } catch (error: any) {
    return createAPIError(error.message, 500);
  }
}
