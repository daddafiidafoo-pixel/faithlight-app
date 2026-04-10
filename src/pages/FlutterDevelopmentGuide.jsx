import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FlutterDevelopmentGuide() {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const codeExamples = {
    apiClientSetup: `import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final String baseUrl = 'https://your-app.base44.com/api';
  late final Dio _dio;
  final _secureStorage = const FlutterSecureStorage();
  
  String? _accessToken;
  String? _refreshToken;
  
  ApiClient() {
    _initializeDio();
  }
  
  void _initializeDio() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ));
    
    // Add auth interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (_accessToken != null) {
            options.headers['Authorization'] = 'Bearer $_accessToken';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          // Auto-refresh token on 401
          if (error.response?.statusCode == 401) {
            try {
              await refreshAccessToken();
              return handler.resolve(await _dio.request(
                error.requestOptions.path,
                options: Options(
                  method: error.requestOptions.method,
                  headers: {
                    ...error.requestOptions.headers,
                    'Authorization': 'Bearer $_accessToken',
                  },
                ),
              ));
            } catch (e) {
              return handler.next(error);
            }
          }
          return handler.next(error);
        },
      ),
    );
  }
  
  Future<void> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    
    _accessToken = response.data['access_token'];
    _refreshToken = response.data['refresh_token'];
    
    await _secureStorage.write(key: 'access_token', value: _accessToken!);
    await _secureStorage.write(key: 'refresh_token', value: _refreshToken!);
  }
  
  Future<void> refreshAccessToken() async {
    final response = await _dio.post('/auth/refresh',
      options: Options(headers: {'Authorization': 'Bearer $_refreshToken'}),
    );
    
    _accessToken = response.data['access_token'];
    await _secureStorage.write(key: 'access_token', value: _accessToken!);
  }
  
  Future<List> getBibleBooks() async {
    final response = await _dio.get('/bible/books');
    return response.data['books'];
  }
  
  Future<String> getAudioStreamUrl(String bookId, int chapterNum) async {
    final response = await _dio.get('/audio/stream/$bookId/$chapterNum');
    return response.data['stream_url'];
  }
}`,

    authFlow: `import 'package:flutter_riverpod/flutter_riverpod.dart';

final apiClientProvider = Provider((ref) => ApiClient());

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  return AuthNotifier(ref.watch(apiClientProvider));
});

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  final ApiClient apiClient;
  
  AuthNotifier(this.apiClient) : super(const AsyncValue.data(null));
  
  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await apiClient.login(email, password);
      final user = await apiClient.getCurrentUser();
      return User.fromJson(user);
    });
  }
  
  Future<void> logout() async {
    await apiClient.logout();
    state = const AsyncValue.data(null);
  }
}

// In your login screen:
Consumer(
  builder: (context, ref, child) {
    return ElevatedButton(
      onPressed: () {
        ref.read(authProvider.notifier).login(email, password);
      },
      child: const Text('Login'),
    );
  },
)`,

    audioPlayer: `import 'package:audio_players/audio_players.dart';

class AudioBiblePlayer {
  final AudioPlayer _player = AudioPlayer();
  final ApiClient apiClient;
  
  Stream<Duration> get positionStream => _player.onPositionChanged;
  Stream<Duration> get durationStream => _player.onDurationChanged;
  Stream<PlayerState> get stateStream => _player.onPlayerStateChanged;
  
  Future<void> playChapter(String bookId, int chapterNum) async {
    try {
      // Get streaming URL
      final streamUrl = await apiClient.getAudioStreamUrl(bookId, chapterNum);
      
      // Play with background audio support
      await _player.play(UrlSource(streamUrl));
    } catch (e) {
      print('Error playing audio: $e');
    }
  }
  
  Future<void> downloadChapter(String bookId, int chapterNum) async {
    try {
      final download = await apiClient.getAudioDownloadUrl(bookId, chapterNum);
      // Use flutter_downloader or similar to download
      // downloadFile(download['url'], 'audio_$bookId\_$chapterNum.m4a');
    } catch (e) {
      print('Error downloading: $e');
    }
  }
  
  Future<void> pause() => _player.pause();
  Future<void> resume() => _player.resume();
  Future<void> seek(Duration duration) => _player.seek(duration);
  Future<void> setPlaybackRate(double rate) => _player.setPlaybackRate(rate);
  Future<void> dispose() => _player.dispose();
}`,

    offlineSync: `import 'package:sqflite/sqflite.dart';

class OfflineSyncManager {
  final Database db;
  final ApiClient apiClient;
  
  // Local cache of downloaded lessons
  Future<void> saveLessonOffline(Map<String, dynamic> lesson) async {
    await db.insert('lessons_offline', {
      'lesson_id': lesson['id'],
      'title': lesson['title'],
      'content': lesson['content'],
      'downloaded_at': DateTime.now().toIso8601String(),
    });
  }
  
  // Sync progress when back online
  Future<void> syncProgressWhenOnline(Connectivity connectivity) async {
    connectivity.onConnectivityChanged.listen((result) async {
      if (result == ConnectivityResult.mobile ||
          result == ConnectivityResult.wifi) {
        // Upload any pending progress
        final pendingProgress = await db.query('progress_pending');
        for (var item in pendingProgress) {
          try {
            await apiClient.markLessonComplete(
              lessonId: item['lesson_id'],
              timeSpentMinutes: item['time_spent'],
            );
            await db.delete('progress_pending',
              where: 'id = ?',
              whereArgs: [item['id']],
            );
          } catch (e) {
            print('Sync error: $e');
          }
        }
      }
    });
  }
}`,

    pushNotifications: `import 'package:firebase_messaging/firebase_messaging.dart';

class PushNotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final ApiClient apiClient;
  
  Future<void> initialize() async {
    // Request permission
    final settings = await _firebaseMessaging.requestPermission();
    
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // Get FCM token
      final token = await _firebaseMessaging.getToken();
      
      // Register device with backend
      await apiClient.registerDeviceForPush(
        deviceToken: token!,
        deviceType: Platform.isIOS ? 'ios' : 'android',
      );
      
      // Listen for foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        print('Message received: \${message.notification?.title}');
        showNotification(message);
      });
      
      // Handle background tap
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        handleNotificationTap(message);
      });
    }
  }
  
  void showNotification(RemoteMessage message) {
    // Show local notification using flutter_local_notifications
  }
  
  void handleNotificationTap(RemoteMessage message) {
    // Navigate to relevant page based on notification type
  }
}`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">Flutter Development Guide</h1>
          <p className="text-xl text-gray-600">
            Build FaithLight's native mobile app using the API documentation and code examples below.
          </p>
        </div>

        {/* Architecture Overview */}
        <Card className="border-l-4 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle>🏗 Architecture Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Frontend (Flutter)</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ Riverpod for state management</li>
                  <li>✓ Dio for HTTP client</li>
                  <li>✓ Flutter Secure Storage for tokens</li>
                  <li>✓ audio_players for playback</li>
                  <li>✓ firebase_messaging for push</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Backend (Base44)</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ REST API endpoints</li>
                  <li>✓ JWT authentication</li>
                  <li>✓ Secure token refresh</li>
                  <li>✓ Audio streaming/download</li>
                  <li>✓ Push notification management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Badge className="bg-blue-600 h-fit">1</Badge>
                <div>
                  <h4 className="font-semibold">Create Flutter Project</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-1">
                    flutter create faithlight --org com.faithlight
                  </code>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-blue-600 h-fit">2</Badge>
                <div>
                  <h4 className="font-semibold">Add Dependencies</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-1">
                    flutter pub add dio flutter_riverpod flutter_secure_storage
                  </code>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-blue-600 h-fit">3</Badge>
                <div>
                  <h4 className="font-semibold">Add Recommended Packages</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-1">
                    flutter pub add audio_players firebase_messaging connectivity_plus sqflite
                  </code>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-blue-600 h-fit">4</Badge>
                <div>
                  <h4 className="font-semibold">Configure API Base URL</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Replace <code className="bg-gray-100 px-1">baseUrl</code> with your Base44 app domain
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>💻 Code Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="apiClient" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="apiClient">API Client</TabsTrigger>
                <TabsTrigger value="auth">Auth Flow</TabsTrigger>
                <TabsTrigger value="audio">Audio Player</TabsTrigger>
                <TabsTrigger value="offline">Offline Sync</TabsTrigger>
              </TabsList>

              {Object.entries(codeExamples).map(([key, code]) => (
                <TabsContent key={key} value={key} className="space-y-3">
                  <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                      <span className="text-sm font-mono">dart</span>
                      <button
                        onClick={() => copyToClipboard(key, code)}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded text-xs"
                      >
                        {copiedId === key ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm">
                      <code>{code}</code>
                    </pre>
                  </div>
                </TabsContent>
              ))}

              <TabsContent value="push" className="space-y-3">
                <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                    <span className="text-sm font-mono">dart</span>
                    <button
                      onClick={() => copyToClipboard('push', codeExamples.pushNotifications)}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded text-xs"
                    >
                      {copiedId === 'push' ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code>{codeExamples.pushNotifications}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Complete API Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              The full API specification is available at this endpoint:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg space-y-3">
              <code className="block bg-white p-3 rounded border">
                GET /functions/flutterApiClient
              </code>
              <p className="text-sm text-gray-600">
                Returns JSON documentation of all API endpoints, request/response formats, and error codes.
              </p>
              <a
                href="/functions/flutterApiClient"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View API Docs
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Feature Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Development Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Phase 1: Foundation (Week 1-2)</h4>
                <ul className="space-y-1 text-sm text-gray-700 ml-4">
                  <li>☐ Setup project structure</li>
                  <li>☐ Implement API client</li>
                  <li>☐ Setup authentication flow</li>
                  <li>☐ Secure token storage</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Phase 2: Core Features (Week 3-5)</h4>
                <ul className="space-y-1 text-sm text-gray-700 ml-4">
                  <li>☐ Bible reading (text + audio)</li>
                  <li>☐ Courses and lessons</li>
                  <li>☐ Progress tracking</li>
                  <li>☐ User profile</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Phase 3: Advanced (Week 6-8)</h4>
                <ul className="space-y-1 text-sm text-gray-700 ml-4">
                  <li>☐ Offline mode (SQLite)</li>
                  <li>☐ Push notifications</li>
                  <li>☐ Community features</li>
                  <li>☐ Subscriptions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle>🔗 Resources & Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Documentation</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://flutter.dev" className="text-blue-600 hover:underline">
                      Flutter Official Docs →
                    </a>
                  </li>
                  <li>
                    <a href="https://pub.dev/packages/riverpod" className="text-blue-600 hover:underline">
                      Riverpod State Management →
                    </a>
                  </li>
                  <li>
                    <a href="https://pub.dev/packages/dio" className="text-blue-600 hover:underline">
                      Dio HTTP Client →
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recommended Packages</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-700">• audio_players - Audio playback</li>
                  <li className="text-gray-700">• firebase_messaging - Push notifications</li>
                  <li className="text-gray-700">• sqflite - Local database</li>
                  <li className="text-gray-700">• connectivity_plus - Network detection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-l-4 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle>🚀 Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2 text-gray-700 list-decimal list-inside">
              <li>
                <strong>Clone the starter template</strong> - Copy the code examples above into your Flutter project
              </li>
              <li>
                <strong>Test endpoints locally</strong> - Use Postman or Insomnia to validate API responses
              </li>
              <li>
                <strong>Build auth UI</strong> - Login/register screens with the auth flow
              </li>
              <li>
                <strong>Implement Bible reader</strong> - Fetch verses and display with proper formatting
              </li>
              <li>
                <strong>Add audio playback</strong> - Integrate audio player for Bible chapters
              </li>
              <li>
                <strong>Setup offline mode</strong> - Cache content locally for offline access
              </li>
              <li>
                <strong>Test on device</strong> - iOS + Android testing before launch
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center text-gray-600">
          <p>Need help? Check the Base44 documentation or contact support@faithlight.com</p>
        </div>
      </div>
    </div>
  );
}