import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MAX_DURATION = 60; // seconds
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    let user;
    
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Please log in' }), { status: 401 });
    }

    // Check if user is premium (use service role to query)
    const premiumEntitlements = await base44.asServiceRole.entities.UserEntitlement.filter(
      { user_id: user.id, entitlement_type: 'faithlight_premium' },
      '-created_date',
      1
    );

    const isPremium = premiumEntitlements && premiumEntitlements.length > 0;
    
    if (!isPremium) {
      return new Response(
        JSON.stringify({ error: 'Premium feature: Voice messages require Premium subscription' }),
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const duration = parseFloat(formData.get('duration')) || 0;
    const conversationId = formData.get('conversation_id');

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), { status: 400 });
    }

    if (!conversationId) {
      return new Response(JSON.stringify({ error: 'No conversation ID provided' }), { status: 400 });
    }

    // Validate duration
    if (duration > MAX_DURATION) {
      return new Response(
        JSON.stringify({ error: `Voice message too long. Maximum ${MAX_DURATION} seconds.` }),
        { status: 400 }
      );
    }

    // Validate file size
    const fileSize = audioFile.size;
    if (fileSize > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum ${Math.round(MAX_SIZE / 1024 / 1024)}MB.` }),
        { status: 400 }
      );
    }

    // Upload file using Base44's UploadFile integration
    const result = await base44.integrations.Core.UploadFile({
      file: audioFile,
    });

    if (!result || !result.file_url) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload audio file' }),
        { status: 500 }
      );
    }

    // Return upload details
    return new Response(
      JSON.stringify({
        success: true,
        audio_url: result.file_url,
        duration_sec: duration,
        size_bytes: fileSize,
        mime_type: audioFile.type || 'audio/webm',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Voice upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Upload failed', details: error.message }),
      { status: 500 }
    );
  }
});