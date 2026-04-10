import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

const MAX_ATTEMPTS = 5;

async function hashOTP(otp) {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { phone_e164, otp_code } = await req.json();

    if (!phone_e164 || !otp_code) {
      return Response.json({ error: 'Missing phone_e164 or otp_code' }, { status: 400 });
    }

    // Find the OTP record
    const otpRecords = await base44.asServiceRole.entities.PhoneOTP.filter({
      phone_e164,
      is_used: false,
    });

    if (!otpRecords || otpRecords.length === 0) {
      return Response.json({ error: 'No active OTP found for this phone' }, { status: 400 });
    }

    const otpRecord = otpRecords[0];

    // Check expiry
    const now = new Date();
    const expiryTime = new Date(otpRecord.expires_at);
    if (now > expiryTime) {
      await base44.asServiceRole.entities.PhoneOTP.update(otpRecord.id, { is_used: true });
      return Response.json({ error: 'OTP expired. Request a new one.' }, { status: 400 });
    }

    // Check attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await base44.asServiceRole.entities.PhoneOTP.update(otpRecord.id, { is_used: true });
      return Response.json({ error: 'Too many failed attempts. Request a new OTP.' }, { status: 429 });
    }

    // Verify OTP
    const otpHash = await hashOTP(otp_code);
    if (otpHash !== otpRecord.otp_hash) {
      await base44.asServiceRole.entities.PhoneOTP.update(otpRecord.id, {
        attempts: otpRecord.attempts + 1,
      });
      const attemptsLeft = MAX_ATTEMPTS - otpRecord.attempts - 1;
      return Response.json({ 
        error: `Invalid OTP. ${attemptsLeft} attempts remaining.` 
      }, { status: 400 });
    }

    // Mark OTP as used
    await base44.asServiceRole.entities.PhoneOTP.update(otpRecord.id, { is_used: true });

    // Check if user exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({
      phone_e164,
    });

    let user = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

    // If new user, create one (without password yet)
    if (!user) {
      user = await base44.asServiceRole.entities.User.create({
        phone_e164,
        phone_verified: true,
        email: null,
        auth_provider: 'phone',
        full_name: `User ${phone_e164}`, // Placeholder; user will update later
      });
    } else {
      // Mark existing user's phone as verified
      await base44.asServiceRole.entities.User.update(user.id, {
        phone_verified: true,
      });
    }

    return Response.json({
      success: true,
      message: 'OTP verified successfully',
      user_id: user.id,
      phone_verified: true,
    });
  } catch (error) {
    console.error('verifyPhoneOTP error:', error);
    return Response.json({ error: error.message || 'Failed to verify OTP' }, { status: 500 });
  }
});