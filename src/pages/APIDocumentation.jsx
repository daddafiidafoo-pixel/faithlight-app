import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function APIDocumentation() {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'bash', id }) => (
    <div className="relative bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto">
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded"
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <pre className="text-sm"><code>{code}</code></pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FaithLight API v1</h1>
          <p className="text-xl text-gray-600">Backend REST API for discipleship platform</p>
          <div className="mt-4 flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-800">OpenAPI 3.0</Badge>
            <Badge className="bg-green-100 text-green-800">JWT Auth</Badge>
            <Badge className="bg-purple-100 text-purple-800">Role-Based Access</Badge>
          </div>
        </div>

        <Tabs defaultValue="auth" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="bible">Bible</TabsTrigger>
          </TabsList>

          {/* Auth */}
          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">JWT Bearer Token</h3>
                  <p className="text-gray-700 mb-4">All endpoints (except /auth/*) require JWT access token in Authorization header.</p>
                  <CodeBlock
                    code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                    id="auth-header"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">1. Register User</h3>
                  <CodeBlock
                    code={`POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "country_code": "US",
  "preferred_language_code": "en"
}`}
                    id="register-req"
                  />
                  <p className="text-sm text-gray-600 mb-3">Password must contain: uppercase, lowercase, number, special character</p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">2. Login</h3>
                  <CodeBlock
                    code={`POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}`}
                    id="login-req"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">3. Refresh Token</h3>
                  <p className="text-gray-700 mb-4">Access tokens expire in 15 minutes. Use refresh token to get new access token.</p>
                  <CodeBlock
                    code={`POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
                    id="refresh-req"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
                  <p className="text-sm"><strong>Token Lifetimes:</strong></p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Access token: 15 minutes</li>
                    <li>• Refresh token: 7 days</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Profile Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Get Current User</h3>
                  <CodeBlock
                    code={`GET /users/me
Authorization: Bearer {access_token}`}
                    id="get-me"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Update Profile</h3>
                  <CodeBlock
                    code={`PATCH /users/me
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "avatar_url": "https://...",
  "preferred_language_code": "om"
}`}
                    id="update-profile"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Get Public Profile</h3>
                  <CodeBlock
                    code={`GET /users/{user_id}`}
                    id="get-public"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spiritual Progress & Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Get User Progress</h3>
                  <CodeBlock
                    code={`GET /progress/me
Authorization: Bearer {access_token}`}
                    id="get-progress"
                  />
                  <CodeBlock
                    code={`{
  "user_id": "uuid",
  "current_level": 1,
  "completed_levels": [],
  "completed_lesson_count": 5,
  "current_level_progress_percent": 25,
  "badges_earned": ["week_one_complete"],
  "leader_eligible": false,
  "learning_streak_current": 3,
  "learning_streak_longest": 7
}`}
                    language="json"
                    id="progress-response"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Get All Spiritual Levels</h3>
                  <CodeBlock
                    code={`GET /progress/levels?language=en`}
                    id="get-levels"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
                  <p className="text-sm"><strong>4 Spiritual Levels:</strong></p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>1️⃣ New Believer - Foundation faith</li>
                    <li>2️⃣ Growing Believer - Deeper understanding</li>
                    <li>3️⃣ Mature Believer - Leadership eligible</li>
                    <li>4️⃣ Teacher/Leader - Admin approved</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Courses & Lessons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">List Courses</h3>
                  <CodeBlock
                    code={`GET /courses?page=1&limit=20&language=en&level=1&status=published`}
                    id="list-courses"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Get Course Details</h3>
                  <CodeBlock
                    code={`GET /courses/{course_id}`}
                    id="get-course"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Get Course Lessons</h3>
                  <CodeBlock
                    code={`GET /courses/{course_id}/lessons?sort=-position`}
                    id="get-lessons"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Create Course (Teacher/Admin)</h3>
                  <CodeBlock
                    code={`POST /courses
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Foundations of Faith",
  "description": "Learn core Christian beliefs",
  "language": "en",
  "level": 1
}`}
                    id="create-course"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community */}
          <TabsContent value="community" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community & Messaging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">List Community Posts</h3>
                  <CodeBlock
                    code={`GET /community/posts?page=1&category=discussion&sort=-created_at`}
                    id="list-posts"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Create Post</h3>
                  <CodeBlock
                    code={`POST /community/posts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Prayer Request",
  "content": "Please pray for my family...",
  "category": "prayer_request"
}`}
                    id="create-post"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Send Direct Message</h3>
                  <CodeBlock
                    code={`POST /messages/{conversation_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content": "Hello, how are you?"
}`}
                    id="send-message"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
                  <p className="text-sm"><strong>Post Categories:</strong></p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• prayer_request</li>
                    <li>• testimony</li>
                    <li>• question</li>
                    <li>• discussion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bible */}
          <TabsContent value="bible" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bible & Translations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Get Translations with Licensing</h3>
                  <p className="text-gray-700 mb-3">Includes `offline_allowed` and `license_notice` for each translation.</p>
                  <CodeBlock
                    code={`GET /bible/translations?language=en&offline_only=false`}
                    id="get-translations"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Translation Response Example</h3>
                  <CodeBlock
                    code={`{
  "translations": [
    {
      "id": "WEB",
      "name": "World English Bible",
      "language_code": "en",
      "offline_allowed": true,
      "license": "public_domain",
      "license_notice": "Public domain worldwide",
      "is_active": true
    },
    {
      "id": "MACQUL",
      "name": "Macaafa Qulqulluu (Oromo)",
      "language_code": "om",
      "offline_allowed": false,
      "license": "copyright_restricted",
      "license_notice": "© Bible Society of Ethiopia",
      "copyright_holder": "Bible Society of Ethiopia"
    }
  ]
}`}
                    language="json"
                    id="translation-response"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Get Available Offline Packs</h3>
                  <CodeBlock
                    code={`GET /bible/packs?language=en&translation_id=WEB`}
                    id="get-packs"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-4 mt-6">
                  <p className="text-sm"><strong>⚠️ Licensing Note:</strong></p>
                  <p className="text-sm mt-2">Always check `offline_allowed` before downloading. Display `license_notice` to users.</p>
                  <ul className="text-sm mt-3 space-y-1">
                    <li>✅ <strong>Public Domain:</strong> KJV, WEB, 1899 Oromo - safe to download</li>
                    <li>🔒 <strong>Copyright Restricted:</strong> MacQul Oromo - online only (licensing required)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Handling */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Error Handling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">All errors follow a standard format:</p>
            <CodeBlock
              code={`{
  "error": "Invalid email format",
  "code": "INVALID_REQUEST",
  "details": {
    "field": "email"
  },
  "timestamp": "2026-02-16T12:34:56Z"
}`}
              language="json"
              id="error-format"
            />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="font-semibold text-sm mb-2">Error Codes:</p>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• UNAUTHORIZED (401)</li>
                  <li>• FORBIDDEN (403)</li>
                  <li>• NOT_FOUND (404)</li>
                  <li>• INVALID_REQUEST (400)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Other Codes:</p>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• QUOTA_EXCEEDED (429)</li>
                  <li>• SUBSCRIPTION_REQUIRED (402)</li>
                  <li>• REGION_RESTRICTED (451)</li>
                  <li>• SERVER_ERROR (500)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-Based Access */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Role-Based Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Free User</h4>
                <div className="text-sm space-y-2">
                  <div><Badge className="bg-green-100 text-green-800">Can</Badge>
                    <ul className="mt-1 text-gray-700">
                      <li>• Read published courses</li>
                      <li>• Browse community</li>
                      <li>• View Bible online</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Premium User</h4>
                <div className="text-sm space-y-2">
                  <div><Badge className="bg-blue-100 text-blue-800">Can</Badge>
                    <ul className="mt-1 text-gray-700">
                      <li>• Access all courses</li>
                      <li>• Download offline (5GB)</li>
                      <li>• Full audio library</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Teacher</h4>
                <div className="text-sm space-y-2">
                  <div><Badge className="bg-purple-100 text-purple-800">Can</Badge>
                    <ul className="mt-1 text-gray-700">
                      <li>• Create courses</li>
                      <li>• Create lessons</li>
                      <li>• Moderate discussions</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Admin</h4>
                <div className="text-sm space-y-2">
                  <div><Badge className="bg-red-100 text-red-800">Can</Badge>
                    <ul className="mt-1 text-gray-700">
                      <li>• All actions</li>
                      <li>• Moderate all content</li>
                      <li>• Manage users</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="font-semibold text-sm">Default Limit</p>
                <p className="text-lg font-bold text-blue-600 mt-1">100 req/min</p>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <p className="font-semibold text-sm">Auth Endpoints</p>
                <p className="text-lg font-bold text-orange-600 mt-1">10 req/min</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">When exceeded: <strong>429 Too Many Requests</strong></p>
            <p className="text-sm text-gray-600">Check response header: <code className="bg-gray-100 px-2 py-1 rounded">X-RateLimit-Remaining</code></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}