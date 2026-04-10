/**
 * Flutter API Client Reference
 * 
 * This is the API contract that the Flutter app uses.
 * All endpoints are available at: https://your-app.base44.com/api
 * 
 * Usage in Flutter:
 * 
 * import 'package:dio/dio.dart';
 * 
 * final dio = Dio(BaseOptions(baseUrl: 'https://your-app.base44.com/api'));
 * 
 * // Add auth token to requests
 * dio.interceptors.add(InterceptorsWrapper(
 *   onRequest: (options, handler) {
 *     options.headers['Authorization'] = 'Bearer $accessToken';
 *     return handler.next(options);
 *   }
 * ));
 * 
 * // Make requests
 * final response = await dio.get('/bible/books');
 */

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Return API documentation for Flutter developers
  const apiDocs = {
    version: '1.0',
    baseUrl: 'https://your-app.base44.com/api',
    auth: {
      type: 'Bearer JWT',
      header: 'Authorization: Bearer {access_token}',
      endpoints: [
        {
          path: 'POST /auth/login',
          description: 'Login with email and password',
          request: { email: 'string', password: 'string' },
          response: {
            user: { id: 'string', email: 'string', full_name: 'string' },
            access_token: 'string',
            refresh_token: 'string',
            expires_in: 3600,
          },
        },
        {
          path: 'POST /auth/register',
          description: 'Register new user',
          request: { email: 'string', password: 'string', full_name: 'string' },
          response: { user: 'object', access_token: 'string', refresh_token: 'string' },
        },
        {
          path: 'GET /auth/me',
          description: 'Get current user',
          requiresAuth: true,
          response: { user: 'object' },
        },
        {
          path: 'POST /auth/refresh',
          description: 'Refresh access token',
          request: 'Use refresh_token in Authorization header',
          response: { access_token: 'string', expires_in: 3600 },
        },
      ],
    },
    bible: {
      endpoints: [
        {
          path: 'GET /bible/books',
          description: 'Get all books of the Bible',
          queryParams: { language: 'string (default: en)' },
          response: {
            books: [
              {
                id: 'string',
                name: 'string',
                abbreviation: 'string',
                chapters: 'number',
                testament: 'old|new',
              },
            ],
          },
        },
        {
          path: 'GET /bible/chapters/:bookId/:chapterNum',
          description: 'Get chapter text',
          queryParams: { translation: 'string (default: kjv)' },
          response: {
            chapter: {
              book_id: 'string',
              chapter_number: 'number',
              verses: [{ verse_number: 'number', text: 'string' }],
            },
          },
        },
        {
          path: 'GET /bible/verses',
          description: 'Get specific verses',
          queryParams: {
            book: 'string',
            chapter: 'number',
            start_verse: 'number (optional)',
            end_verse: 'number (optional)',
            translation: 'string',
          },
          response: {
            verses: [
              { book: 'string', chapter: 'number', verse: 'number', text: 'string' },
            ],
          },
        },
        {
          path: 'GET /bible/search',
          description: 'Search Bible for keyword',
          queryParams: {
            q: 'string',
            limit: 'number (default: 20)',
            translation: 'string',
          },
          response: { results: 'array' },
        },
      ],
    },
    progress: {
      endpoints: [
        {
          path: 'GET /progress/spiritual/:userId',
          description: 'Get spiritual growth progress',
          requiresAuth: true,
          response: {
            progress: {
              current_level: 'number',
              completed_lesson_count: 'number',
              current_level_progress_percent: 'number',
              badges_earned: 'array<string>',
            },
          },
        },
        {
          path: 'GET /progress/courses/:userId',
          description: 'Get course progress',
          requiresAuth: true,
          response: {
            courses: [
              {
                course_id: 'string',
                title: 'string',
                progress_percent: 'number',
                status: 'in_progress|completed',
              },
            ],
          },
        },
        {
          path: 'POST /progress/lessons/complete',
          description: 'Mark lesson as complete',
          requiresAuth: true,
          request: { lesson_id: 'string', time_spent_minutes: 'number' },
          response: {
            updated_progress: 'object',
            level_progression: 'object',
          },
        },
      ],
    },
    courses: {
      endpoints: [
        {
          path: 'GET /courses',
          description: 'Get all published courses',
          queryParams: {
            published: 'boolean (default: true)',
            language: 'string (default: en)',
          },
          response: {
            courses: [
              {
                id: 'string',
                title: 'string',
                description: 'string',
                lesson_count: 'number',
                cover_image: 'string',
              },
            ],
          },
        },
        {
          path: 'GET /courses/:courseId',
          description: 'Get course with all lessons',
          response: {
            course: {
              id: 'string',
              title: 'string',
              lessons: 'array<object>',
            },
          },
        },
        {
          path: 'GET /lessons/:lessonId',
          description: 'Get lesson details with quiz',
          requiresAuth: true,
          response: {
            lesson: {
              id: 'string',
              title: 'string',
              content: 'string (HTML)',
              duration_minutes: 'number',
              quiz: 'object',
            },
          },
        },
      ],
    },
    audio: {
      endpoints: [
        {
          path: 'GET /audio/books',
          description: 'Get available audio books',
          queryParams: { language: 'string' },
          response: {
            books: [
              {
                id: 'string',
                name: 'string',
                language: 'string',
                voice_type: 'string',
                total_chapters: 'number',
              },
            ],
          },
        },
        {
          path: 'GET /audio/stream/:bookId/:chapterNum',
          description: 'Get audio stream URL for real-time listening',
          requiresAuth: true,
          queryParams: { language: 'string' },
          response: {
            stream_url: 'string (HLS or M4A)',
            duration_seconds: 'number',
            size_bytes: 'number',
          },
          note: 'Use for real-time streaming (low bandwidth)',
        },
        {
          path: 'GET /audio/download/:bookId/:chapterNum',
          description: 'Get download URL for offline listening',
          requiresAuth: true,
          queryParams: { language: 'string' },
          response: {
            download_url: 'string',
            file_hash: 'string (for verification)',
            size_bytes: 'number',
            expires_in: 'number (seconds)',
          },
          note: 'Use for offline downloads (higher quality)',
        },
      ],
    },
    community: {
      endpoints: [
        {
          path: 'GET /community/friends/:userId',
          description: 'Get user friends list',
          requiresAuth: true,
          response: {
            friends: [
              {
                id: 'string',
                name: 'string',
                avatar_url: 'string',
                spiritual_level: 'number',
              },
            ],
          },
        },
        {
          path: 'POST /community/messages',
          description: 'Send direct message',
          requiresAuth: true,
          request: { recipient_id: 'string', message: 'string' },
          response: { message: 'object' },
        },
        {
          path: 'GET /community/messages/:friendId',
          description: 'Get message history with friend',
          requiresAuth: true,
          queryParams: { limit: 'number (default: 50)' },
          response: { messages: 'array<object>' },
        },
      ],
    },
    subscription: {
      endpoints: [
        {
          path: 'GET /subscription/:userId',
          description: 'Get subscription status',
          requiresAuth: true,
          response: {
            subscription: {
              status: 'active|expired|cancelled',
              plan: 'free|premium|church',
              renewal_date: 'string (ISO date)',
              price_per_month_cents: 'number',
            },
          },
        },
        {
          path: 'POST /subscription/checkout',
          description: 'Create Stripe checkout session',
          requiresAuth: true,
          request: {
            plan: 'premium|church',
            billing_period: 'monthly|yearly',
          },
          response: {
            checkout_url: 'string (Stripe Checkout URL)',
            session_id: 'string',
          },
        },
      ],
    },
    notifications: {
      endpoints: [
        {
          path: 'POST /notifications/register',
          description: 'Register device for push notifications',
          requiresAuth: true,
          request: {
            device_token: 'string (FCM token)',
            device_type: 'ios|android',
            device_name: 'string (optional)',
          },
          response: { device_registered: true },
        },
        {
          path: 'PUT /notifications/preferences',
          description: 'Update notification preferences',
          requiresAuth: true,
          request: {
            lesson_reminders: 'boolean',
            trial_reminders: 'boolean',
            course_updates: 'boolean',
            community_notifications: 'boolean',
          },
          response: { preferences_updated: true },
        },
      ],
    },
    errorHandling: {
      statusCodes: {
        200: 'Success',
        201: 'Created',
        400: 'Bad request (invalid data)',
        401: 'Unauthorized (missing/invalid token)',
        403: 'Forbidden (no permission)',
        404: 'Not found',
        429: 'Rate limited',
        500: 'Server error',
      },
      errorFormat: {
        success: false,
        error: 'Error message',
        error_code: 'ERROR_CODE',
        details: 'Additional details',
      },
      rateLimits: {
        general: '100 requests/minute',
        auth: '10 requests/minute',
        downloads: '5 concurrent per user',
      },
    },
  };

  return Response.json({
    success: true,
    data: apiDocs,
    message:
      'Use this documentation to build the Flutter client. All endpoints use standard HTTP verbs and JSON.',
  });
});