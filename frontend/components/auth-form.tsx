'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Code, Mail, Check, X } from 'lucide-react';

type AuthFormProps = {
  mode: 'login' | 'register';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;
    
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return '#ef4444'; // red
    if (strength <= 2) return '#f97316'; // orange
    if (strength <= 3) return '#eab308'; // yellow
    if (strength <= 4) return '#84cc16'; // lime
    return '#22c55e'; // green
  };

  // Password requirements check
  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordStrength = calculatePasswordStrength(password);

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);

    try {
      const email = form.get('email') as string;
      const password = form.get('password') as string;
      const displayName = form.get('display_name') as string;
      const path = mode === 'login' ? '/auth/token/' : '/auth/register/';
      const payload = mode === 'login'
        ? { username: email, password: password }
        : {
            email: email,
            username: email,
            display_name: displayName,
            password: password,
          };
      
      const data: any = await api(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      if (mode === 'register') {
        // After registration, show OTP verification screen
        setRegistrationEmail(email);
        setShowOTPVerification(true);
        setError('');
        return;
      }
      
      // Login mode
      const tokens = data.tokens ?? data;
      if (tokens.access && tokens.refresh) {
        localStorage.setItem('lifeos_access', tokens.access);
        localStorage.setItem('lifeos_refresh', tokens.refresh);
        
        if (mode === 'login' && email) {
          const emailPart = email.split('@')[0];
          const nameOnly = emailPart.replace(/\d+/g, '');
          const displayName = nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);
          localStorage.setItem('userName', displayName);
        }
        
        localStorage.setItem('userEmail', email);
        
        try {
          const profileData = await api('/auth/profile/', { method: 'GET' });
          if (profileData && profileData.created_at) {
            const joinDate = profileData.created_at.split('T')[0];
            localStorage.setItem('userJoinDate', joinDate);
          }
        } catch (err) {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('userJoinDate', today);
        }
        
        router.push('/dashboard');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setOtpLoading(true);
    setError('');

    try {
      const data: any = await api('/auth/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: registrationEmail,
          otp: otp,
        }),
      });

      if (data.tokens && data.tokens.access && data.tokens.refresh) {
        localStorage.setItem('lifeos_access', data.tokens.access);
        localStorage.setItem('lifeos_refresh', data.tokens.refresh);
        localStorage.setItem('userEmail', registrationEmail);
        
        const emailPart = registrationEmail.split('@')[0];
        const nameOnly = emailPart.replace(/\d+/g, '');
        const displayName = nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);
        localStorage.setItem('userName', displayName);

        try {
          const profileData = await api('/auth/profile/', { method: 'GET' });
          if (profileData && profileData.created_at) {
            const joinDate = profileData.created_at.split('T')[0];
            localStorage.setItem('userJoinDate', joinDate);
          }
        } catch (err) {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('userJoinDate', today);
        }

        router.push('/dashboard');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'OTP verification failed';
      setError(errorMsg);
    } finally {
      setOtpLoading(false);
    }
  }

  async function resendOTP() {
    setOtpLoading(true);
    setError('');

    try {
      await api('/auth/resend-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: registrationEmail,
          purpose: 'verify',
        }),
      });
      setError('');
      alert('OTP resent to your email');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resend OTP';
      setError(errorMsg);
    } finally {
      setOtpLoading(false);
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const redirectUri = `${window.location.origin}/auth/callback`;

    if (provider === 'google') {
      // Initiate Google OAuth flow
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const scope = 'openid email profile';
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=google`;
      window.location.href = googleAuthUrl;
    } else if (provider === 'github') {
      // Initiate GitHub OAuth flow
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const scope = 'user:email';
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=github`;
      window.location.href = githubAuthUrl;
    }
  };

  return (
    <div>
      {/* OTP VERIFICATION SCREEN (shown after registration) */}
      {showOTPVerification && mode === 'register' ? (
        <div className="auth-otp-container">
          <div className="auth-otp-header">
            <h2 className="auth-otp-title">Verify Your Email</h2>
            <p className="auth-otp-subtitle">Enter the 6-digit OTP sent to {registrationEmail}</p>
          </div>

          <form onSubmit={verifyOTP} className="auth-form-modern">
            <label className="auth-field">
              <span className="auth-label">Enter OTP</span>
              <input
                required
                type="text"
                placeholder="000000"
                className="auth-input auth-input-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength={6}
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button disabled={otpLoading || otp.length !== 6} type="submit" className="auth-submit">
              {otpLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="auth-otp-actions">
            <button
              type="button"
              onClick={resendOTP}
              disabled={otpLoading}
              className="auth-otp-resend"
            >
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setShowOTPVerification(false);
                setOtp('');
                setError('');
              }}
              className="auth-otp-back"
            >
              Back to Registration
            </button>
          </div>
        </div>
      ) : (
        /* REGULAR LOGIN/REGISTRATION FORM */
        <>
          {/* STEP 1: SOCIAL BUTTONS AT TOP */}
          <div className="auth-social-buttons-large">
            <button 
              type="button" 
              className="auth-social-btn-full auth-social-google" 
              onClick={() => handleSocialLogin('google')}
            >
              <Mail size={20} />
              <span>{mode === 'login' ? 'Continue' : 'Sign up'} with Google</span>
            </button>
            <button 
              type="button" 
              className="auth-social-btn-full auth-social-github" 
              onClick={() => handleSocialLogin('github')}
            >
              <Code size={20} />
              <span>{mode === 'login' ? 'Continue' : 'Sign up'} with GitHub</span>
            </button>
          </div>

          {/* STEP 2: OR DIVIDER */}
          <div className="auth-divider-large">
            <span>OR</span>
          </div>

          {/* STEP 3: FORM FIELDS */}
          <form onSubmit={submit} className="auth-form-modern">
            {mode === 'register' && (
              <label className="auth-field">
                <span className="auth-label">Name</span>
                <input name="display_name" placeholder="Enter your full name" className="auth-input" />
              </label>
            )}
            
            <label className="auth-field">
              <span className="auth-label">Email</span>
              <input required name="email" type="email" placeholder="Enter your email address" className="auth-input" />
            </label>
            
            <label className="auth-field">
              <span className="auth-label">Password</span>
              <input 
                required 
                name="password" 
                type="password" 
                placeholder="Enter a secure password" 
                className="auth-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Password Strength Indicator */}
              {mode === 'register' && password && (
                <div>
                  {/* Strength Bar */}
                  <div className="auth-password-strength">
                    <div className="auth-strength-bar">
                      <div 
                        className="auth-strength-fill"
                        style={{
                          width: `${(passwordStrength / 6) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(passwordStrength),
                        }}
                      />
                    </div>
                    <span 
                      className="auth-strength-text"
                      style={{ color: getPasswordStrengthColor(passwordStrength) }}
                    >
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="auth-requirements">
                    <div className={`auth-requirement ${passwordRequirements.length ? 'met' : ''}`}>
                      {passwordRequirements.length ? (
                        <Check size={16} className="auth-requirement-icon" />
                      ) : (
                        <X size={16} className="auth-requirement-icon" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    
                    <div className={`auth-requirement ${passwordRequirements.uppercase ? 'met' : ''}`}>
                      {passwordRequirements.uppercase ? (
                        <Check size={16} className="auth-requirement-icon" />
                      ) : (
                        <X size={16} className="auth-requirement-icon" />
                      )}
                      <span>One uppercase letter (A-Z)</span>
                    </div>
                    
                    <div className={`auth-requirement ${passwordRequirements.lowercase ? 'met' : ''}`}>
                      {passwordRequirements.lowercase ? (
                        <Check size={16} className="auth-requirement-icon" />
                      ) : (
                        <X size={16} className="auth-requirement-icon" />
                      )}
                      <span>One lowercase letter (a-z)</span>
                    </div>
                    
                    <div className={`auth-requirement ${passwordRequirements.number ? 'met' : ''}`}>
                      {passwordRequirements.number ? (
                        <Check size={16} className="auth-requirement-icon" />
                      ) : (
                        <X size={16} className="auth-requirement-icon" />
                      )}
                      <span>One number (0-9)</span>
                    </div>
                    
                    <div className={`auth-requirement ${passwordRequirements.special ? 'met' : ''}`}>
                      {passwordRequirements.special ? (
                        <Check size={16} className="auth-requirement-icon" />
                      ) : (
                        <X size={16} className="auth-requirement-icon" />
                      )}
                      <span>One special character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
            </label>

            {mode === 'register' && (
              <label className="auth-field">
                <span className="auth-label">Confirm Password</span>
                <input 
                  required 
                  type="password" 
                  placeholder="Re-enter your password" 
                  className="auth-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
            )}

            {mode === 'login' && (
              <label className="auth-remember">
                <input type="checkbox" name="rememberMe" />
                <span>Remember me for 30 days</span>
              </label>
            )}
            
            {mode === 'register' && (
              <label className="auth-agreement">
                <input required type="checkbox" />
                <span>I agree to build a calmer, more intentional life.</span>
              </label>
            )}
            
            {error && <p className="auth-error">{error}</p>}
            
            <button 
              disabled={loading || (mode === 'register' && !allRequirementsMet)} 
              type="submit" 
              className="auth-submit"
            >
              {loading ? 'Preparing your dashboard...' : mode === 'login' ? 'Continue to Life OS' : 'Create my Life OS'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
