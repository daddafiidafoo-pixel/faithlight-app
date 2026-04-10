/**
 * PWA Manifest Configuration for FaithLight
 * Add to index.html head: <link rel="manifest" href="/manifest.json">
 */

export const manifestConfig = {
  "name": "FaithLight - Biblical Discipleship",
  "short_name": "FaithLight",
  "description": "Grow step-by-step in your faith with structured biblical discipleship and community",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#4f46e5",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/faithlight-icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/faithlight-icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/faithlight-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["education", "lifestyle", "religion"],
  "screenshots": [
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/faithlight-screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/faithlight-screenshot-2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "shortcuts": [
    {
      "name": "Bible Reader",
      "short_name": "Read",
      "description": "Open Bible Reader",
      "url": "/BibleReader",
      "icons": [{ "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/icon-bible.png", "sizes": "192x192" }]
    },
    {
      "name": "Audio Bible",
      "short_name": "Listen",
      "description": "Listen to Audio Bible",
      "url": "/AudioBible",
      "icons": [{ "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/icon-audio.png", "sizes": "192x192" }]
    },
    {
      "name": "My Learning",
      "short_name": "Learn",
      "description": "Continue your learning",
      "url": "/Home",
      "icons": [{ "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/icon-learn.png", "sizes": "192x192" }]
    }
  ],
  "prefer_related_applications": false
};

/**
 * Note: Add to index.html <head>:
 * <link rel="manifest" href="/manifest.json">
 * <meta name="theme-color" content="#4f46e5">
 * <meta name="mobile-web-app-capable" content="yes">
 * <meta name="apple-mobile-web-app-capable" content="yes">
 * <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
 * <meta name="apple-mobile-web-app-title" content="FaithLight">
 */