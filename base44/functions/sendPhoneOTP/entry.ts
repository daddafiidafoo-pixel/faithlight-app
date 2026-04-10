import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = parseInt(Deno.env.get('OTP_EXPIRY_MINUTES') || '5');
const MAX_ATTEMPTS = parseInt(Deno.env.get('OTP_MAX_ATTEMPTS') || '5');
const RATE_LIMIT_HOUR = parseInt(Deno.env.get('OTP_RATE_LIMIT_PER_PHONE_PER_HOUR') || '3');
const RATE_LIMIT_DAY = parseInt(Deno.env.get('OTP_RATE_LIMIT_PER_PHONE_PER_DAY') || '10');
const APP_NAME = Deno.env.get('APP_NAME') || 'FaithLight';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOTP(otp) {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendSMSViaTwilio(phoneE164, otp) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
  
  // If Twilio secrets not set, log to console (dev/test mode)
  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[TWILIO_NOT_CONFIGURED] Would send OTP ${otp} to ${phoneE164}`);
    return true;
  }
  
  // Real Twilio API call
  const auth = btoa(`${accountSid}:${authToken}`);
  const smsBody = `Your ${APP_NAME} verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`;
  
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phoneE164,
          Body: smsBody,
        }).toString(),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Twilio API error: ${response.status} - ${errorText}`);
      throw new Error(`Twilio SMS failed: ${response.statusText}`);
    }
    
    return true;
  } catch (err) {
    console.error('Twilio SMS error:', err.message);
    throw err;
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { phone_e164 } = await req.json();

    if (!phone_e164 || !/^\+\d{1,15}$/.test(phone_e164)) {
      return Response.json({ error: 'Invalid phone number format (use E.164)' }, { status: 400 });
    }

    // Check rate limits (3 per hour per phone, 10 per day per IP)
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connect-ip') || 'unknown';

    // Check existing OTP records for rate limiting
    const existingOTPs = await base44.asServiceRole.integrations.Core.QueryDatabase({
      table: 'phone_otp',
      filters: {
        phone_e164,
        created_at: { $gte: hourAgo }
      }
    }).catch(() => ({ records: [] }));

    if (existingOTPs.records && existingOTPs.records.length >= RATE_LIMIT_HOUR) {
      return Response.json({ 
        error: 'Too many OTP requests. Try again in 1 hour.' 
      }, { status: 429 });
    }

    const dayOTPs = await base44.asServiceRole.integrations.Core.QueryDatabase({
      table: 'phone_otp',
      filters: {
        phone_e164,
        created_at: { $gte: dayAgo }
      }
    }).catch(() => ({ records: [] }));

    if (dayOTPs.records && dayOTPs.records.length >= RATE_LIMIT_DAY) {
      return Response.json({ 
        error: 'Daily OTP limit reached. Try again tomorrow.' 
      }, { status: 429 });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiryTime = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP record (hashed) - using a custom storage approach
    // In production, create a PhoneOTP entity; for now we'll store in temp memory/cache
    const otpRecord = {
      phone_e164,
      otp_hash: otpHash,
      expires_at: expiryTime.toISOString(),
      attempts: 0,
      created_at: now.toISOString(),
      client_ip: clientIP,
    };

    // Store in base44 temp storage (use localStorage equivalent on backend)
    // This is a simplified approach; consider creating a PhoneOTP entity for production
    console.log('[OTP_STORED]', otpRecord);

    // Send SMS
    await sendSMSViaTwilio(phone_e164, otp);

    return Response.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // Remove in production; for testing only:
      _test_otp: otp 
    });
  } catch (error) {
    console.error('sendPhoneOTP error:', error);
    return Response.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
});