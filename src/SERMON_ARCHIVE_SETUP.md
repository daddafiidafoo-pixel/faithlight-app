# Sermon Archive & Live Streaming Integration Guide

Complete implementation of automatic sermon recording, archival, and real-time YouTube/Facebook streaming.

## Features

✅ **Automatic Recording**: All live broadcasts are automatically recorded and saved  
✅ **Platform Integration**: Real RTMP streaming to YouTube and Facebook Live  
✅ **Archive Management**: View, download, share, and organize past sermons  
✅ **Content Management System**: Full CMS for ministry sermon library  
✅ **Video Metadata**: Titles, descriptions, scripture references, speaker names, tags  
✅ **Access Control**: Public/private toggles, download permissions  

---

## Setup Instructions

### 1. Database Entity

The `SermonArchive` entity is already created with full support for:
- Recording metadata (title, description, duration, file size)
- Platform info (YouTube, Facebook, Internal)
- Video URLs and thumbnail images
- Statistics (view counts, engagement)
- Organization (tags, scripture references, speaker names)

### 2. Backend Functions

Three core functions handle streaming and recording:

#### **youtubeStreamManager.js**
Manages YouTube Live broadcasting:
```javascript
{
  "action": "create_broadcast",
  "sermonTitle": "Sunday Sermon",
  "description": "Sermon description",
  "isPublic": true
}
```

Returns RTMP credentials for ingesting video:
```json
{
  "broadcastId": "xyz...",
  "rtmpUrl": "rtmps://a.rtmp.youtube.com/live2/",
  "streamKey": "...",
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

#### **facebookStreamManager.js**
Manages Facebook Live broadcasting:
```javascript
{
  "action": "create_broadcast",
  "sermonTitle": "Sunday Sermon",
  "pageId": "your_facebook_page_id",
  "description": "Sermon details",
  "isPublic": true
}
```

Returns Facebook RTMP credentials and stores archive automatically.

#### **rtmpBroadcaster.js**
Orchestrates the streaming process and handles local recording sessions.

### 3. YouTube OAuth Setup

To enable YouTube streaming:

1. **Create OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable YouTube Data API v3
   - Create OAuth 2.0 Client ID (Desktop application)
   - Save Client ID and Client Secret

2. **Set Environment Variables**
   ```
   YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   YOUTUBE_CLIENT_SECRET=your_client_secret
   YOUTUBE_API_KEY=your_api_key
   YOUTUBE_REFRESH_TOKEN=generated_by_oauth_flow
   ```

3. **Generate Refresh Token**
   - Use OAuth playground: https://developers.google.com/oauthplayground/
   - Authorize YouTube scope: `https://www.googleapis.com/auth/youtube`
   - Exchange authorization code for refresh token
   - Store refresh token in env

### 4. Facebook OAuth Setup

To enable Facebook streaming:

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create new app
   - Add "Pages" product

2. **Get Page Access Token**
   - In App Dashboard, go to Tools > Graph API Explorer
   - Select your app and page
   - Request `pages_manage_metadata,pages_read_engagement,pages_manage_posts,live_video` scopes
   - Generate long-lived token

3. **Set Environment Variables**
   ```
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   FACEBOOK_PAGE_ACCESS_TOKEN=long_lived_page_token
   ```

### 5. Frontend Integration

The LiveBroadcast page automatically handles:
- Platform selection (YouTube, Facebook)
- RTMP credential generation
- Real-time status updates
- Archive creation

#### Using with OBS/Streamlabs:

1. User selects platform and enters broadcast details
2. Click "Start Live Broadcast"
3. App generates RTMP URL and Stream Key
4. Copy RTMP URL into OBS/Streamlabs
5. Begin streaming from your recording software
6. Broadcast automatically saved to archive when stream ends

### 6. Archive Management

Access at `/SermonArchive` route:

**Features:**
- **Search & Filter**: By status, platform, date, tags
- **Bulk Operations**: Download, delete, organize
- **Video Player**: Watch directly in app
- **Social Sharing**: Share on social media or via link
- **Statistics**: View count, duration, file size tracking
- **Metadata**: Add scripture references, speaker names, tags

### 7. Recording Workflow

#### YouTube Stream:
1. User creates broadcast on YouTube Live
2. Gets RTMP URL and stream key
3. Streams from OBS/device to YouTube RTMP
4. YouTube automatically records the broadcast
5. Archive record created in FaithLight
6. After stream ends, video accessible in Archive page
7. Users can download, share, or re-broadcast

#### Facebook Stream:
1. User creates broadcast on Facebook
2. Gets RTMP URL from Facebook
3. Streams from OBS/device to Facebook RTMP
4. Facebook automatically saves the video
5. Archive record created in FaithLight
6. Video accessible through both Facebook and Archive page

#### Internal Recording (Agora/WebRTC):
1. User starts recording session
2. Agora RTC captures video stream
3. Recording saved to cloud storage
4. Archive record updated with video URL
5. Video accessible in Archive page with full CMS features

---

## API Endpoints

### Create YouTube Broadcast
```
POST /functions/youtubeStreamManager
{
  "action": "create_broadcast",
  "sermonTitle": string,
  "description": string,
  "isPublic": boolean
}
```

### End YouTube Broadcast
```
POST /functions/youtubeStreamManager
{
  "action": "end_broadcast",
  "broadcastId": string
}
```

### Create Facebook Broadcast
```
POST /functions/facebookStreamManager
{
  "action": "create_broadcast",
  "sermonTitle": string,
  "description": string,
  "pageId": string,
  "isPublic": boolean
}
```

### End Facebook Broadcast
```
POST /functions/facebookStreamManager
{
  "action": "end_broadcast",
  "videoId": string
}
```

---

## Archive Data Structure

Each sermon archive includes:

```json
{
  "title": "Sunday Service",
  "description": "Sermon on faith",
  "recorded_date": "2026-03-29T10:00:00Z",
  "duration_seconds": 3600,
  "status": "published",
  "streaming_platform": "youtube",
  "platform_video_id": "dQw4w9WgXcQ",
  "platform_url": "https://youtube.com/watch?v=...",
  "video_url": "https://storage.example.com/sermon.mp4",
  "thumbnail_url": "https://storage.example.com/thumb.jpg",
  "view_count": 234,
  "speaker_name": "Pastor John",
  "scripture_references": ["John 3:16", "Romans 6:23"],
  "tags": ["faith", "easter", "featured"],
  "is_public": true,
  "download_allowed": true,
  "file_size_mb": 450.5
}
```

---

## Testing

### Test YouTube Integration
1. Set up OAuth credentials
2. Navigate to `/LiveBroadcast`
3. Select YouTube platform
4. Enter broadcast title
5. Click "Start Live Broadcast"
6. Verify RTMP URL displayed
7. Use test OBS setup to stream
8. Stop broadcast and verify archive created

### Test Facebook Integration
1. Set up Facebook page token
2. Navigate to `/LiveBroadcast`
3. Select Facebook platform
4. Enter page ID and broadcast title
5. Click "Start Live Broadcast"
6. Get RTMP credentials from response
7. Stream via OBS/Streamlabs
8. Verify video in Facebook and Archive

### Test Archive Manager
1. Create test broadcast
2. Navigate to `/SermonArchive`
3. Test search and filters
4. Download sample archive
5. Test sharing functionality

---

## Troubleshooting

### YouTube Broadcast Fails
- **Issue**: "Failed to authenticate with YouTube"
- **Solution**: Refresh YOUTUBE_REFRESH_TOKEN; regenerate via OAuth playground

### Facebook Broadcast Fails
- **Issue**: "No ingest stream available"
- **Solution**: Verify FACEBOOK_PAGE_ACCESS_TOKEN is long-lived and has required scopes

### RTMP Connection Issues
- **Issue**: OBS can't connect to RTMP URL
- **Solution**: Check firewall, use correct stream key, verify URL format

### Videos Not Recording
- **Issue**: Archive created but no video_url set
- **Solution**: Ensure streaming service (YouTube/Facebook) settings enable automatic recording

---

## Next Steps

1. ✅ Database schema created
2. ✅ Backend functions implemented
3. ✅ Frontend UI built
4. **TODO**: Set up OAuth credentials for YouTube/Facebook
5. **TODO**: Configure environment variables
6. **TODO**: Test end-to-end streaming workflow
7. **TODO**: Deploy to production
8. **TODO**: Configure cloud storage for internal videos (S3/GCS)

---

## Production Checklist

- [ ] YouTube OAuth credentials configured
- [ ] Facebook page token configured
- [ ] Cloud storage (S3/GCS) setup for video files
- [ ] CDN configured for fast video delivery
- [ ] Analytics tracking enabled
- [ ] Rate limiting on stream endpoints
- [ ] Error logging configured
- [ ] Backup strategy for archived videos
- [ ] Privacy policy updated for video storage
- [ ] DMCA takedown process documented

---

**Last updated**: 2026-03-29  
**Status**: Ready for OAuth configuration and testing