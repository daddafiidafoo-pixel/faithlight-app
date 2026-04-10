import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { RtcTokenBuilder, RtcRole } from 'npm:agora-access-token@2.0.0';

// Rate limiting: track token requests per user per minute
const tokenRequestCache = new Map(); // { "user_id": { count, resetTime } }
const MAX_TOKENS_PER_MINUTE = 10;

function checkRateLimit(userId) {
  const now = Date.now();
  const userKey = userId;
  
  if (!tokenRequestCache.has(userKey)) {
    tokenRequestCache.set(userKey, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  const record = tokenRequestCache.get(userKey);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + 60000;
    return true;
  }
  
  if (record.count >= MAX_TOKENS_PER_MINUTE) {
    return false;
  }
  
  record.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RATE LIMITING CHECK
    if (!checkRateLimit(user.id)) {
      return Response.json(
        { error: 'Too many token requests. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const { roomId, role: clientRole } = await req.json();

    if (!roomId || !clientRole) {
      return Response.json({ error: 'Missing roomId or role' }, { status: 400 });
    }

    // Fetch room details
    const room = await base44.asServiceRole.entities.LiveRoom.read(roomId);
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    // Ensure channel_id exists (generate if missing, for backward compat)
    let channelId = room.channel_id;
    if (!channelId) {
      // Generate UUID for channel
      channelId = crypto.randomUUID();
      await base44.asServiceRole.entities.LiveRoom.update(roomId, { channel_id: channelId });
    }

    // Fetch user entitlement
    const entitlements = await base44.asServiceRole.entities.UserEntitlement.filter(
      { user_id: user.id }
    );
    const entitlement = entitlements[0];

    // PERMISSION VALIDATION - Determine actual role from backend, not client
    let actualRole = 'listener'; // Default safe role

    const isHost = user.id === room.host_id;
    const isCohost = user.user_role === 'admin';
    const hasPremium = entitlement && entitlement.plan === 'premium';

    // VIDEO ROOMS: Premium required (audience only)
    if (room.type === 'video') {
      if (!hasPremium && !isHost) {
        return Response.json(
          { error: 'Premium plan required for video rooms' },
          { status: 403 }
        );
      }
      actualRole = isHost ? 'host' : 'listener';
    }

    // AUDIO STAGE: Determine role server-side
    if (room.type === 'audio_stage') {
      if (isHost) {
        // Host can speak
        actualRole = 'host';
      } else if (clientRole === 'speaker' || clientRole === 'cohost') {
        // Check if user is approved to speak
        const isLeader = ['leader', 'admin'].includes(user.user_role);
        const hasApproval = hasPremium || isLeader;

        if (!hasApproval) {
          // Check for host-approved raise hand
          const approvedRequests = await base44.asServiceRole.entities.LiveRequest.filter({
            room_id: roomId,
            user_id: user.id,
            status: 'approved'
          });
          if (approvedRequests.length === 0) {
            actualRole = 'listener'; // Downgrade to listener
          } else {
            actualRole = 'speaker';
          }
        } else {
          actualRole = 'speaker';
        }
      } else {
        actualRole = 'listener';
      }
    }

    // ROOM LOCKED: Only host can join when locked
    if (room.is_locked && !isHost) {
      return Response.json(
        { error: 'Room is locked. No new participants allowed.' },
        { status: 403 }
      );
    }

    // Generate token
    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!appId || !appCertificate) {
      console.error('Agora credentials missing: AGORA_APP_ID or AGORA_APP_CERTIFICATE not set');
      return Response.json(
        { error: 'Agora credentials not configured' },
        { status: 500 }
      );
    }

    const uid = parseInt(user.id.replace(/\D/g, '').slice(0, 10)) || Math.floor(Math.random() * 1000000);
    const expirationTimeInSeconds = 300; // 5 minutes - short TTL for security
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

    const agoraRole = actualRole === 'listener' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelId, // Use UUID channel_id, not roomId
      uid,
      agoraRole,
      privilegeExpireTime
    );

    console.log(`Token generated for user ${user.id} in room ${roomId} with role ${actualRole}`);

    return Response.json({
      appId,
      token,
      channelName: channelId, // Return UUID channel, not roomId
      uid,
      role: actualRole,
      expiresAt: new Date(privilegeExpireTime * 1000).toISOString()
    });

  } catch (error) {
    console.error('Token generation error:', error.message, error.stack);
    return Response.json(
      { error: 'Failed to generate token', details: error.message },
      { status: 500 }
    );
  }
});