# Phone Authentication Setup Guide

## Overview
This is a complete phone auth system with OTP verification and password-based login. Email auth remains unchanged.

## What's Implemented

### Backend Endpoints (Functions)
1. **sendPhoneOTP** - Generate & send OTP via SMS
2. **verifyPhoneOTP** - Verify OTP code and mark phone verified
3. **setPhonePassword** - Set password after OTP verification
4. **phoneLogin** - Login with phone + password
5. **phoneResetPassword** - Reset password via OTP

### Database
- Extended **User entity** with:
  - `phone_e164` (unique, E.164 format)
  - `phone_verified` (boolean)
  - `password_hash` (hashed password)
  - `auth_provider` (email|phone|both)
  - `last_country_code` (for UX)
- Created **PhoneOTP entity** for secure OTP storage

### Frontend
- **AuthPage** - Complete login/signup with Email|Phone tabs
- **CountryCodeSelector** - 20+ countries with auto-detect
- Multi-step phone flow: Send → Verify → Set Password

## Setup Steps

### Step 1: Set Twilio Secrets (Required for SMS)
Go to Dashboard → Settings → Environment Variables, add:
```
TWILIO_ACCOUNT_SID = your_account_sid
TWILIO_AUTH_TOKEN = your_auth_token
TWILIO_PHONE_NUMBER = +1234567890
```

Get credentials from: https://console.twilio.com

### Step 2: Uncomment Twilio Code
In `functions/sendPhoneOTP.js`, uncomment the real Twilio API call (lines ~23-45) and remove the MOCK SMS section.

### Step 3: Test the Auth Flow
1. Navigate to `/AuthPage`
2. Click **Phone** tab
3. Enter country + number
4. Click **Send Code**
5. Enter OTP (shown in console for testing)
6. Set password & create account
7. Login with phone + password

## Security Features

✅ **OTP Expiry** - 5 minutes  
✅ **Max Attempts** - 5 wrong attempts blocks OTP  
✅ **Rate Limiting** - 3/hour per phone, 10/day per IP  
✅ **OTP Hashing** - SHA-256, never stored plaintext  
✅ **Password Hashing** - SHA-256 (consider bcrypt in production)  
✅ **E.164 Format** - Standardized global phone format  
✅ **Unique Constraint** - One phone = one account  

## Flow Diagrams

### Signup Flow (Phone)
```
1. User enters phone + country
2. Click "Send Code"
3. OTP sent via SMS
4. User enters OTP (6 digits)
5. OTP verified → phone_verified = true
6. User sets password
7. Account created → auto-redirect to /Home
```

### Login Flow (Phone)
```
1. User enters phone + country
2. User enters password
3. Backend verifies password hash
4. Session created → redirect to /Home
```

### Password Reset (Phone)
```
1. Click "Forgot Password"
2. Enter phone + country
3. Click "Send Code"
4. Verify OTP
5. Set new password
6. Auto-redirect to login
```

## Testing Without Twilio

For development, the system currently:
- Generates real OTP codes
- Logs them to console (search for `[MOCK SMS]`)
- **Does NOT send SMS** (mocked)
- Works end-to-end for testing locally

Once Twilio secrets are set, SMS will send automatically.

## Files Overview

```
functions/
├── sendPhoneOTP.js         # Generate + send OTP (mocked SMS)
├── verifyPhoneOTP.js       # Verify OTP code
├── setPhonePassword.js     # Set password after OTP
├── phoneLogin.js           # Login with phone+password
├── phoneResetPassword.js   # Reset password flow

pages/
├── AuthPage.jsx            # Login/signup UI (Email + Phone tabs)

components/auth/
├── CountryCodeSelector.jsx # Country picker + auto-detect

entities/
├── User.json               # Extended with phone fields
├── PhoneOTP.json           # OTP storage (hashed)
```

## Email Auth (Unchanged)
Email auth still works via Base44's built-in system. The AuthPage redirects to Base44 login for email.

## Next Steps (Future Enhancements)

- [ ] Add bcrypt password hashing (more secure than SHA-256)
- [ ] Add Vonage/AWS SNS as SMS fallback
- [ ] Add CAPTCHA to prevent brute force
- [ ] Add 2FA support
- [ ] Add biometric login (Face ID / fingerprint)
- [ ] Add account recovery via email
- [ ] Add session management / logout
- [ ] Add phone number change flow
- [ ] Add email+phone dual auth

## Troubleshooting

**Q: I get "OTP sent" but no SMS**  
A: This is normal! SMS is mocked until Twilio secrets are set. Check browser console for the test OTP.

**Q: "Invalid phone number format"**  
A: Must include country code (e.g., +254701234567, not 0701234567).

**Q: "Phone already exists"**  
A: That phone is registered. Try login instead of signup.

**Q: OTP expired**  
A: OTP lasts 5 minutes. Click "Send code" again to request new one.

**Q: 500 error on send OTP**  
A: Check function logs in dashboard. Likely missing Twilio secrets.

---

**Version**: 1.0  
**Last Updated**: Feb 2026  
**Status**: Ready for testing (SMS mocked, logic complete)