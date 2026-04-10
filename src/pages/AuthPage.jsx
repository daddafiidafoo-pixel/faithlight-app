import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight, Apple } from 'lucide-react';
import CountryCodeSelector from '@/components/auth/CountryCodeSelector';
import AppleSignInButton from '@/components/auth/AppleSignInButton';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('email');
  const [authMode, setAuthMode] = useState('login'); // login or signup
  
  // Email auth
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  
  // Phone auth
  const [countryCode, setCountryCode] = useState(() => {
    return localStorage.getItem('lastCountryCode') || '+1';
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [showPhonePassword, setShowPhonePassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        window.location.href = '/Home';
      }
    };
    checkAuth();
  }, []);

  // Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Use Base44's built-in email login
      // Note: Base44 handles email auth via dashboard; this is a reference point
      alert('Email login redirects to Base44 login page');
      base44.auth.redirectToLogin();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Email Signup
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      alert('Signup via Base44 dashboard. This page is for phone auth demo.');
      base44.auth.redirectToLogin();
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Phone: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!phoneNumber || phoneNumber.length < 9) {
        setError('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      const phoneE164 = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      const response = await base44.functions.invoke('sendPhoneOTP', { 
        phone_e164: phoneE164 
      });

      if (response.data.success) {
        setOtpSent(true);
        setSuccess('OTP sent! Check your messages.');
        // For testing: show OTP in console
        if (response.data._test_otp) {
          console.log('TEST OTP (remove in production):', response.data._test_otp);
        }
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Phone: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (otpCode.length !== 6) {
        setError('Please enter a 6-digit OTP');
        setLoading(false);
        return;
      }

      const phoneE164 = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      const response = await base44.functions.invoke('verifyPhoneOTP', { 
        phone_e164: phoneE164,
        otp_code: otpCode 
      });

      if (response.data.success) {
        setPhoneVerified(true);
        setSuccess('Phone verified! Now set your password.');
        setOtpCode('');
      } else {
        setError(response.data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Phone: Set Password (after OTP verification)
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (phonePassword.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }

      if (phonePassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const phoneE164 = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      const response = await base44.functions.invoke('setPhonePassword', { 
        phone_e164: phoneE164,
        password: phonePassword 
      });

      if (response.data.success) {
        setSuccess('Password set! You can now login with your phone and password.');
        // Auto-login or redirect
        setTimeout(() => {
          window.location.href = '/Home';
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to set password');
      }
    } catch (err) {
      setError(err.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  // Phone: Login (with phone + password)
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!phoneNumber) {
        setError('Please enter your phone number');
        setLoading(false);
        return;
      }

      if (!phonePassword) {
        setError('Please enter your password');
        setLoading(false);
        return;
      }

      const phoneE164 = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      const response = await base44.functions.invoke('phoneLogin', { 
        phone_e164: phoneE164,
        password: phonePassword 
      });

      if (response.data.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/Home';
        }, 1500);
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">FaithLight</CardTitle>
          <CardDescription>Login or signup to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </TabsTrigger>
            </TabsList>

            {/* EMAIL TAB */}
            <TabsContent value="email" className="space-y-4 mt-4">
              <form onSubmit={authMode === 'login' ? handleEmailLogin : handleEmailSignup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showEmailPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-2.5 text-gray-500"
                    >
                      {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </Button>

                {/* Apple Sign-In */}
                <div className="mt-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <AppleSignInButton />
                </div>
              </form>
            </TabsContent>

            {/* PHONE TAB */}
            <TabsContent value="phone" className="space-y-4 mt-4">
              {/* Step 1: Phone number + Send OTP */}
              {!otpSent && !phoneVerified && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg font-semibold">
                        {countryCode}
                      </span>
                      <Input
                        type="tel"
                        placeholder="701234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {success}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    Send Code
                  </Button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {otpSent && !phoneVerified && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                    Enter the 6-digit code sent to {countryCode} {phoneNumber}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Verification Code</label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      maxLength="6"
                      className="text-center text-lg tracking-widest"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {success}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Verify Code
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      setError('');
                    }}
                    className="w-full text-sm text-blue-600 hover:underline"
                  >
                    Back to phone number
                  </button>
                </form>
              )}

              {/* Step 3: Set Password (after OTP verified, for signup) */}
              {phoneVerified && authMode === 'signup' && (
                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Phone verified! Now set your password.
                  </div>

                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        type={showPhonePassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={phonePassword}
                        onChange={(e) => setPhonePassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhonePassword(!showPhonePassword)}
                        className="absolute right-3 top-2.5 text-gray-500"
                      >
                        {showPhonePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {success}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </form>
              )}

              {/* Login after account created */}
              {authMode === 'login' && (
                <form onSubmit={handlePhoneLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg font-semibold">
                        {countryCode}
                      </span>
                      <Input
                        type="tel"
                        placeholder="701234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        type={showPhonePassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={phonePassword}
                        onChange={(e) => setPhonePassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhonePassword(!showPhonePassword)}
                        className="absolute right-3 top-2.5 text-gray-500"
                      >
                        {showPhonePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {success}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Login
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* Auth mode toggle */}
          <div className="mt-6 text-center text-sm">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setOtpSent(false);
                    setPhoneVerified(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setOtpSent(false);
                    setPhoneVerified(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}