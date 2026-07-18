import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion } from 'motion/react';
import { 
  Lock, User, Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2, 
  Mail, Phone, ShieldCheck, KeyRound, HelpCircle, Shield, ArrowRight,
  RefreshCw, Terminal, Eye as EyeIcon, MessageSquare
} from 'lucide-react';
import { addActivityLog } from '../lib/cmsStore';
import { dispatchAutomatedEmail, getEmailLogs } from '../lib/emailService';

interface OwnerLoginProps {
  navigate: (page: Page) => void;
}

export default function OwnerLogin({ navigate }: OwnerLoginProps) {
  const [isOwnerSetupComplete, setIsOwnerSetupComplete] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [currentStage, setCurrentStage] = useState<'login' | 'two_factor' | 'recover' | 'reset_password'>('login');
  
  // Owner login credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 2-Factor Authentication state
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [input2FACode, setInput2FACode] = useState('');
  const [ownerFor2FA, setOwnerFor2FA] = useState<any>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpTarget, setOtpTarget] = useState('');

  // Account Recovery options
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone' | 'questions' | null>(null);
  const [recoveryStep, setRecoveryStep] = useState<'email_input' | 'verify' | 'questions'>('email_input');
  
  // Simulated Code verification
  const [generatedRecoveryCode, setGeneratedRecoveryCode] = useState('');
  const [recoveryCodeExpiry, setRecoveryCodeExpiry] = useState<number>(0);
  const [inputRecoveryCode, setInputRecoveryCode] = useState('');
  
  // Security Question Verification
  const [ownerSecurityQuestions, setOwnerSecurityQuestions] = useState<any[]>([]);
  const [qAnswer1, setQAnswer1] = useState('');
  const [qAnswer2, setQAnswer2] = useState('');
  const [qAnswer3, setQAnswer3] = useState('');
  const [activeOwnerObj, setActiveOwnerObj] = useState<any>(null);

  // New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Setup Wizard inputs
  const [setupFullName, setSetupFullName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setup2FAEnabled, setSetup2FAEnabled] = useState(false);
  
  // Recovery Setup Info
  const [setupRecoveryEmail, setSetupRecoveryEmail] = useState('');
  const [setupRecoveryPhone, setSetupRecoveryPhone] = useState('');
  
  // Security Questions setup
  const [setupQ1, setSetupQ1] = useState('What was the name of your first childhood pet?');
  const [setupQ2, setSetupQ2] = useState('In what city or town did your parents meet?');
  const [setupQ3, setSetupQ3] = useState('What was the make and model of your first car?');
  const [setupA1, setSetupA1] = useState('');
  const [setupA2, setSetupA2] = useState('');
  const [setupA3, setSetupA3] = useState('');

  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: Questions, 3: Verification

  // Verification stage
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [pendingOwnerObj, setPendingOwnerObj] = useState<any>(null);

  // Live Simulated Email Logs state
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [showEmailLogsDrawer, setShowEmailLogsDrawer] = useState(true);

  // Questions definitions
  const questionPool = [
    'What was the name of your first childhood pet?',
    'In what city or town did your parents meet?',
    'What was the make and model of your first car?',
    'What is your mother’s maiden name?',
    'What was the name of your elementary school?',
    'Which city did you spend your honeymoon in?'
  ];

  const sha256 = async (string: string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const loadLogs = () => {
    try {
      setEmailLogs(getEmailLogs().slice(-6).reverse());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Check if an Owner account already exists in users list
    const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const ownerExists = users.some((u: any) => u.role === 'Owner');
    
    setIsOwnerSetupComplete(ownerExists);
    
    if (!ownerExists) {
      setShowSetupWizard(true);
    }

    // Load initial email logs and watch for updates
    loadLogs();
    const handleLogsUpdate = () => {
      loadLogs();
    };
    window.addEventListener('ztr_email_dispatched', handleLogsUpdate);
    return () => {
      window.removeEventListener('ztr_email_dispatched', handleLogsUpdate);
    };
  }, []);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!email.trim() || !password) {
      setAuthError('Please fill in secure owner credentials.');
      return;
    }

    setAuthLoading(true);
    try {
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      const ownerAccount = storedUsers.find((u: any) => u.role === 'Owner');

      if (!ownerAccount) {
        setAuthError('No Owner account exists on this workspace. Please run the setup wizard.');
        setAuthLoading(false);
        return;
      }

      // 1. Check Lockout duration
      const lockoutTime = localStorage.getItem('ztr_lockout_until_owner');
      if (lockoutTime && parseInt(lockoutTime) > Date.now()) {
        const diff = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000 / 60);
        setAuthError(`Owner access is locked due to repeated failed logins. Please try again in ${diff} minute(s).`);
        setAuthLoading(false);
        return;
      }

      // Check account lockout status in db
      if (ownerAccount.isLocked || ownerAccount.status === 'Locked') {
        setAuthError('Owner account has been administratively suspended.');
        setAuthLoading(false);
        return;
      }

      // Match credentials
      const inputHash = await sha256(password);
      const isMatch = (ownerAccount.email?.toLowerCase() === email.trim().toLowerCase() || ownerAccount.username?.toLowerCase() === email.trim().toLowerCase()) && ownerAccount.passwordHash === inputHash;

      if (isMatch) {
        // Clear failed logins
        localStorage.removeItem('ztr_failed_attempts_owner');
        localStorage.removeItem('ztr_lockout_until_owner');

        // Check if 2FA is active
        // DEV BYPASS: Skip 2FA if VITE_AUTH_BYPASS_VERIFICATION is enabled in dev or AUTH_MODE is development.
        // To re-enable verification: Set VITE_AUTH_BYPASS_VERIFICATION=false in .env.
        const isBypassActive = (process.env.AUTH_MODE === 'development') || (import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS_VERIFICATION === 'true');

        if (!isBypassActive && ownerAccount.twoFactorEnabled) {
          setOwnerFor2FA(ownerAccount);
          setOtpTarget(ownerAccount.email);
          setAuthLoading(true);

          try {
            const res = await fetch('/api/otp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                target: ownerAccount.email,
                type: 'email',
                name: ownerAccount.name,
                context: '2fa'
              })
            });
            const data = await res.json();
            if (data.success) {
              setResendCountdown(data.resendInSeconds || 45);
              addActivityLog(ownerAccount.name, 'twoFactorChallenged', 'Owner login initiated. Dispatched 2FA authentication challenge code.');
              setAuthSuccess('Credentials matched! Dispatched 2FA security code to your business email.');
              setCurrentStage('two_factor');
            } else {
              setAuthError(data.error || 'Failed to dispatch 2FA security verification code.');
            }
          } catch (err: any) {
            setAuthError('Connection error: ' + err.message);
          } finally {
            setAuthLoading(false);
          }
        } else {
          // Normal Login
          establishOwnerSession(ownerAccount);
        }
      } else {
        // Increment failed count
        let attempts = parseInt(localStorage.getItem('ztr_failed_attempts_owner') || '0') + 1;
        localStorage.setItem('ztr_failed_attempts_owner', attempts.toString());

        if (attempts >= 5) {
          localStorage.setItem('ztr_lockout_until_owner', (Date.now() + 15 * 60 * 1000).toString());
          addActivityLog('System Security', 'ownerAccountLocked', 'Owner account has been locked for 15 minutes due to 5 consecutive failed login attempts.');
          setAuthError('Owner account is locked for 15 minutes due to too many failed login attempts.');
        } else {
          setAuthError(`Invalid credentials. Attempt ${attempts} of 5 before account lockout.`);
        }
      }
    } catch (err: any) {
      setAuthError('Error authenticating Owner: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: otpTarget,
          code: input2FACode.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        addActivityLog(ownerFor2FA.name, 'twoFactorApproved', 'Owner 2FA security verification approved.');
        establishOwnerSession(ownerFor2FA);
      } else {
        setAuthError(data.error || 'Invalid or expired 2FA security code.');
      }
    } catch (err: any) {
      setAuthError('Verification error: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const establishOwnerSession = (owner: any) => {
    const userInfo = {
      username: owner.username,
      name: owner.name,
      role: 'Owner',
      email: owner.email,
      phone: owner.phone || '',
      company: 'Zanzibar Trip & Relax'
    };

    localStorage.setItem('ztr_active_session', JSON.stringify({
      user: userInfo,
      timestamp: Date.now()
    }));

    addActivityLog(owner.name, 'loggedIn', 'Owner logged into command console successfully.');
    setAuthSuccess(`Master session authorized! Welcome back, ${owner.name}.`);

    setTimeout(() => {
      navigate('admin/dashboard');
    }, 1500);
  };

  // Setup Wizard Stage handlers
  const handleOwnerSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    setSetupSuccess('');

    if (!setupFullName.trim() || !setupEmail.trim() || !setupPhone.trim() || !setupPassword || !setupConfirmPassword) {
      setSetupError('Please populate all personal details.');
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setSetupError('Passwords do not match.');
      return;
    }

    if (setupPassword.length < 8) {
      setSetupError('Master password must be at least 8 characters long for production security.');
      return;
    }

    // Advance to Questions setup
    setSetupStep(2);
  };

  const handleQuestionsSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (!setupA1.trim() || !setupA2.trim() || !setupA3.trim()) {
      setSetupError('Please answer all 3 security questions to complete multi-layered recovery setup.');
      return;
    }

    if (setupQ1 === setupQ2 || setupQ2 === setupQ3 || setupQ1 === setupQ3) {
      setSetupError('Please select three unique security questions.');
      return;
    }

    // Trigger verification code step
    setAuthLoading(true);
    try {
      const generatedToken = 'VTF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      setVerificationToken(generatedToken);

      const ownerUsername = setupEmail.trim().split('@')[0].toLowerCase();
      
      const newOwner = {
        username: ownerUsername,
        name: setupFullName.trim(),
        email: setupEmail.trim().toLowerCase(),
        phone: setupPhone.trim(),
        company: 'Zanzibar Trip & Relax',
        role: 'Owner',
        status: 'Active',
        verified: false,
        twoFactorEnabled: setup2FAEnabled,
        recoveryEmail: setupRecoveryEmail.trim().toLowerCase() || setupEmail.trim().toLowerCase(),
        recoveryPhone: setupRecoveryPhone.trim() || setupPhone.trim(),
        securityQuestions: [
          { q: setupQ1, a: setupA1.trim().toLowerCase() },
          { q: setupQ2, a: setupA2.trim().toLowerCase() },
          { q: setupQ3, a: setupA3.trim().toLowerCase() }
        ],
        created_at: new Date().toISOString()
      };

      setPendingOwnerObj(newOwner);

      // Dispatch simulated email
      dispatchAutomatedEmail('verification', newOwner.email, newOwner.name, {
        token: generatedToken,
        email: newOwner.email
      });

      addActivityLog(newOwner.name, 'ownerSetupInitiated', 'Owner creation setup initiated. Dispatched email confirmation code.');
      
      setSetupSuccess('Verification code sent! Retrieve the token from the Live Email Logs console below.');
      setIsVerifying(true);
      setSetupStep(3);
    } catch (err: any) {
      setSetupError('Setup initialization failed: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    
    // DEV BYPASS: Skip token verification if VITE_AUTH_BYPASS_VERIFICATION is enabled in dev or AUTH_MODE is development.
    // To re-enable verification: Set VITE_AUTH_BYPASS_VERIFICATION=false in .env.
    const isBypassActive = (process.env.AUTH_MODE === 'development') || (import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS_VERIFICATION === 'true');

    if (!isBypassActive && inputToken.trim() !== verificationToken) {
      setSetupError('Invalid verification code. Please check your simulated email inbox below.');
      return;
    }

    try {
      setAuthLoading(true);
      const hashedPass = await sha256(setupPassword);
      const activeOwner = { 
        ...pendingOwnerObj, 
        passwordHash: hashedPass,
        verified: true 
      };

      const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      
      // Save Owner account securely (guaranteed unique Owner account setup)
      const filteredUsers = users.filter((u: any) => u.role !== 'Owner');
      localStorage.setItem('ztr_admin_users', JSON.stringify([activeOwner, ...filteredUsers]));
      localStorage.setItem('ztr_owner_setup_complete', 'true');

      addActivityLog(activeOwner.name, 'ownerCreated', 'Pristine Owner account deployed and verified successfully.');
      setSetupSuccess('Verification successful! Master Owner account is activated. Launching workstation dashboard...');

      // Establish session
      localStorage.setItem('ztr_active_session', JSON.stringify({
        user: {
          username: activeOwner.username,
          name: activeOwner.name,
          role: 'Owner',
          email: activeOwner.email,
          phone: activeOwner.phone,
          company: 'Zanzibar Trip & Relax'
        },
        timestamp: Date.now()
      }));

      setTimeout(() => {
        setIsOwnerSetupComplete(true);
        setShowSetupWizard(false);
        navigate('admin/dashboard');
      }, 1500);
    } catch (err: any) {
      setSetupError('Error completing verification: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Account Recovery flows
  const handleInitiateRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!recoveryEmailInput.trim()) {
      setAuthError('Please enter your business email.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const ownerAccount = storedUsers.find((u: any) => u.role === 'Owner' && u.email?.toLowerCase() === recoveryEmailInput.trim().toLowerCase());

    if (!ownerAccount) {
      setAuthError('No Master Owner registered with this business email.');
      return;
    }

    setActiveOwnerObj(ownerAccount);
    setOwnerSecurityQuestions(ownerAccount.securityQuestions || []);
    setRecoveryStep('verify');
    setRecoveryMethod('email'); // Default to email reset link

    // DEV BYPASS: Skip verification challenge and go directly to reset password if enabled in dev.
    // To re-enable verification: Set VITE_AUTH_BYPASS_VERIFICATION=false in .env.
    if (import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS_VERIFICATION === 'true') {
      setAuthSuccess('Development Mode Bypass: Verification challenge skipped.');
      setCurrentStage('reset_password');
      return;
    }

    // Generate code
    generateAndSendRecoveryCode('email', ownerAccount);
  };

  const generateAndSendRecoveryCode = (method: 'email' | 'phone', owner: any) => {
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    setInputRecoveryCode('');

    const target = method === 'email' ? (owner.recoveryEmail || owner.email) : (owner.recoveryPhone || owner.phone);
    setOtpTarget(target);

    fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target,
        type: method,
        name: owner.name,
        context: 'recovery'
      })
    })
    .then(async (res) => {
      const data = await res.json();
      setAuthLoading(false);
      if (data.success) {
        setResendCountdown(data.resendInSeconds || 45);
        if (method === 'email') {
          setAuthSuccess(`Sent password reset code to verified email address [${target}].`);
          addActivityLog(owner.name, 'recoveryInitiated', 'Dispatched password reset token to owner verification email.');
        } else {
          setAuthSuccess(`Sent SMS verification code to mobile [${target}].`);
          addActivityLog(owner.name, 'recoveryInitiatedPhone', `Dispatched SMS verification recovery token to [${target}].`);
        }
      } else {
        setAuthError(data.error || 'Failed to dispatch security code.');
      }
    })
    .catch((err) => {
      setAuthLoading(false);
      setAuthError('Connection failure: ' + err.message);
    });
  };

  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: otpTarget,
          code: inputRecoveryCode.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setAuthSuccess('Recovery credentials verified successfully! Establish a new master password.');
        setCurrentStage('reset_password');
      } else {
        setAuthError(data.error || 'Invalid or expired recovery code.');
      }
    } catch (err: any) {
      setAuthError('Verification error: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifySecurityQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!ownerSecurityQuestions || ownerSecurityQuestions.length < 3) {
      setAuthError('No security questions were configured for this Master account. Use email recovery.');
      return;
    }

    const a1Match = qAnswer1.trim().toLowerCase() === ownerSecurityQuestions[0].a;
    const a2Match = qAnswer2.trim().toLowerCase() === ownerSecurityQuestions[1].a;
    const a3Match = qAnswer3.trim().toLowerCase() === ownerSecurityQuestions[2].a;

    if (a1Match && a2Match && a3Match) {
      setAuthSuccess('Security verification approved! Establish a new master password.');
      setCurrentStage('reset_password');
    } else {
      addActivityLog(activeOwnerObj.name, 'recoveryQuestionsFailed', 'Failed security questions recovery challenge.');
      setAuthError('Incorrect answers. Answers must exactly match the responses provided during account setup.');
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!newPassword || !confirmNewPassword) {
      setAuthError('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setAuthError('Secure password must be at least 8 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const hashedPass = await sha256(newPassword);
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      
      const updatedUsers = storedUsers.map((u: any) => {
        if (u.role === 'Owner') {
          return {
            ...u,
            passwordHash: hashedPass
          };
        }
        return u;
      });

      localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));
      
      // Dispatch alert
      dispatchAutomatedEmail('security_alert', activeOwnerObj.email, activeOwnerObj.name, {
        subject: '🔒 Security Alert: Master Password Changed',
        message: 'Your system Owner password was updated successfully via multi-layered recovery. If you did not perform this change, immediately inspect your security logs.'
      });

      addActivityLog(activeOwnerObj.name, 'passwordRecovered', 'Owner password updated successfully via secure account recovery.');
      setAuthSuccess('Credentials updated! Navigating back to Owner secure login...');

      // Reset states
      setEmail(activeOwnerObj.email);
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      setTimeout(() => {
        setCurrentStage('login');
      }, 2000);
    } catch (err: any) {
      setAuthError('Failed to change password: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02050E] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0B3B8C] rounded-full filter blur-[150px] opacity-25 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#D4A017] rounded-full filter blur-[180px] opacity-15 pointer-events-none" />

      <div className="max-w-md w-full relative z-10 my-10 space-y-6">
        <div className="bg-[#040A18] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-full flex items-center justify-center mb-2">
              <ShieldCheck className="w-8 h-8 text-[#D4A017]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-serif">
              Owner Secure Console
            </h1>
            <p className="text-xs text-[#D4A017] font-semibold tracking-widest uppercase font-mono">
              {showSetupWizard ? 'Deploy Master Administrator' : 'Secure Session Hub'}
            </p>
          </div>

          {/* SETUP WIZARD FOR THE SINGULAR MASTER ACCOUNT */}
          {showSetupWizard ? (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/25 text-blue-300 p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold text-white">⚙️ System Setup Wizard</p>
                <p>No master Owner credentials exist. Initialize the single master account to access all ERP features. External self-registration will be disabled immediately after.</p>
              </div>

              {setupError && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0 text-red-400" />
                  <span>{setupError}</span>
                </div>
              )}

              {setupSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                  <span>{setupSuccess}</span>
                </div>
              )}

              {setupStep === 1 && (
                <form onSubmit={handleOwnerSetupSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider font-mono">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={setupFullName}
                        onChange={e => setSetupFullName(e.target.value)}
                        className="w-full text-xs bg-[#081226] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-medium"
                        placeholder="Owner Full Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider font-mono">Master Business Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={setupEmail}
                        onChange={e => setSetupEmail(e.target.value)}
                        className="w-full text-xs bg-[#081226] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                        placeholder="owner@zanzibartripandrelax.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider font-mono">Master Mobile Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={setupPhone}
                        onChange={e => setSetupPhone(e.target.value)}
                        className="w-full text-xs bg-[#081226] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
                        placeholder="+255 777 999 888"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider font-mono">Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={setupPassword}
                          onChange={e => setSetupPassword(e.target.value)}
                          className="w-full text-xs bg-[#081226] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider font-mono">Confirm</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={setupConfirmPassword}
                          onChange={e => setSetupConfirmPassword(e.target.value)}
                          className="w-full text-xs bg-[#081226] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Backup Recovery Config */}
                  <div className="bg-white/5 p-4 rounded-2xl space-y-3">
                    <p className="text-[10px] uppercase font-bold text-[#D4A017] tracking-wider font-mono">🛡️ Backup Recovery Config (Optional)</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-semibold text-slate-400 font-mono">Backup Recovery Email</label>
                        <input
                          type="email"
                          value={setupRecoveryEmail}
                          onChange={e => setSetupRecoveryEmail(e.target.value)}
                          className="w-full text-[10px] bg-[#050D1C] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                          placeholder="backup@gmail.com"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-semibold text-slate-400 font-mono">Backup Recovery Phone</label>
                        <input
                          type="text"
                          value={setupRecoveryPhone}
                          onChange={e => setSetupRecoveryPhone(e.target.value)}
                          className="w-full text-[10px] bg-[#050D1C] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                          placeholder="+255 655 444 333"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="setup_2fa"
                        checked={setup2FAEnabled}
                        onChange={e => setSetup2FAEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#D4A017] rounded focus:outline-none cursor-pointer"
                      />
                      <label htmlFor="setup_2fa" className="text-[10px] text-slate-300 font-medium select-none cursor-pointer">
                        Enable Two-Factor Authentication (2FA) via simulated code
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Configure Questions</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {setupStep === 2 && (
                <form onSubmit={handleQuestionsSetupSubmit} className="space-y-4">
                  <div className="bg-[#D4A017]/10 border border-[#D4A017]/20 p-3.5 rounded-xl text-[11px] text-slate-300">
                    🔒 <strong className="text-[#D4A017]">Fallback Recovery:</strong> Configure three distinct security questions. These answers will unlock credentials should your primary email and phone recovery routes ever fail.
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-bold text-slate-400 font-mono">Security Question 1</label>
                      <select
                        value={setupQ1}
                        onChange={e => setSetupQ1(e.target.value)}
                        className="w-full text-xs bg-[#081226] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none"
                      >
                        {questionPool.map((q, idx) => (
                          <option key={idx} value={q}>{q}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={setupA1}
                        onChange={e => setSetupA1(e.target.value)}
                        className="w-full text-xs bg-[#050D1C] border border-white/15 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] font-medium"
                        placeholder="Answer 1"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-bold text-slate-400 font-mono">Security Question 2</label>
                      <select
                        value={setupQ2}
                        onChange={e => setSetupQ2(e.target.value)}
                        className="w-full text-xs bg-[#081226] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none"
                      >
                        {questionPool.map((q, idx) => (
                          <option key={idx} value={q}>{q}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={setupA2}
                        onChange={e => setSetupA2(e.target.value)}
                        className="w-full text-xs bg-[#050D1C] border border-white/15 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] font-medium"
                        placeholder="Answer 2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-bold text-slate-400 font-mono">Security Question 3</label>
                      <select
                        value={setupQ3}
                        onChange={e => setSetupQ3(e.target.value)}
                        className="w-full text-xs bg-[#081226] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none"
                      >
                        {questionPool.map((q, idx) => (
                          <option key={idx} value={q}>{q}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={setupA3}
                        onChange={e => setSetupA3(e.target.value)}
                        className="w-full text-xs bg-[#050D1C] border border-white/15 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] font-medium"
                        placeholder="Answer 3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSetupStep(1)}
                      className="bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-xs uppercase font-bold transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-xl text-xs uppercase font-black transition-all"
                    >
                      {authLoading ? 'Dispatching...' : 'Dispatch Code'}
                    </button>
                  </div>
                </form>
              )}

              {setupStep === 3 && (
                <form onSubmit={handleVerifyToken} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider font-mono text-center">Verify Verification Code</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={inputToken}
                        onChange={e => setInputToken(e.target.value.toUpperCase())}
                        className="w-full text-sm bg-[#081226] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white text-center font-mono focus:outline-none focus:border-[#D4A017] transition-all tracking-[0.25em]"
                        placeholder="VTF-XXXXXX"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    {authLoading ? 'Activating account...' : 'Verify & Activate Master Session'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSetupStep(2)}
                    className="w-full text-center text-xs text-slate-400 hover:text-white underline block"
                  >
                    Change questions config
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* STAGE SELECTORS */
            <div className="space-y-4">
              {authError && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0 text-red-400" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* LOGIN VIEW */}
              {currentStage === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Owner Email / Username</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full text-sm bg-[#081226] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-medium"
                        placeholder="owner@zanzibartripandrelax.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Secure Master Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStage('recover');
                          setRecoveryStep('email_input');
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                        className="text-xs text-[#D4A017] hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      {showPassword ? (
                        <EyeOff size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowPassword(false)} />
                      ) : (
                        <Eye size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                      )}
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full text-sm bg-[#081226] border border-white/15 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#D4A017]/10"
                  >
                    {authLoading ? 'Verifying Safe Session...' : 'Authenticate Master Session'}
                  </button>
                </form>
              )}

              {/* 2-FACTOR AUTHENTICATION VIEW */}
              {currentStage === 'two_factor' && (
                <form onSubmit={handle2FAVerify} className="space-y-4">
                  <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 p-4 rounded-xl text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-[#D4A017]">🛡️ Two-Factor Verification Challenge</p>
                    <p>Enter the 6-character authentication code sent to your verified business email address to authorize access.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider font-mono text-center">2FA Authentication Code</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={input2FACode}
                        onChange={e => setInput2FACode(e.target.value.toUpperCase())}
                        className="w-full text-sm bg-[#081226] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white text-center font-mono focus:outline-none focus:border-[#D4A017] transition-all tracking-[0.25em]"
                        placeholder="2FA-XXXXXX"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Approve 2FA and Access Console
                  </button>

                  <div className="flex justify-between text-xs font-semibold">
                    <button
                      type="button"
                      disabled={resendCountdown > 0 || authLoading}
                      onClick={() => {
                        setAuthLoading(true);
                        fetch('/api/otp/send', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            target: ownerFor2FA.email,
                            type: 'email',
                            name: ownerFor2FA.name,
                            context: '2fa'
                          })
                        })
                        .then(async (res) => {
                          const data = await res.json();
                          setAuthLoading(false);
                          if (data.success) {
                            setResendCountdown(data.resendInSeconds || 45);
                            setAuthSuccess('New 2FA security code successfully dispatched to your email!');
                          } else {
                            setAuthError(data.error || 'Failed to dispatch 2FA code.');
                          }
                        })
                        .catch((err) => {
                          setAuthLoading(false);
                          setAuthError('Connection error: ' + err.message);
                        });
                      }}
                      className="text-slate-400 hover:text-white underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                    >
                      {resendCountdown > 0 ? `Resend 2FA Code (${resendCountdown}s)` : 'Resend 2FA Code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStage('login');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-slate-400 hover:text-white underline"
                    >
                      Back to Credentials Login
                    </button>
                  </div>
                </form>
              )}

              {/* FORGOT PASSWORD / RECOVERY FLOW */}
              {currentStage === 'recover' && (
                <div className="space-y-4">
                  {recoveryStep === 'email_input' && (
                    <form onSubmit={handleInitiateRecovery} className="space-y-4">
                      <div className="bg-slate-500/10 border border-slate-500/25 p-4 rounded-xl text-xs text-slate-300">
                        <p className="font-bold text-slate-200">🔒 System Account Recovery Portal</p>
                        <p className="mt-1">Provide your verified Master business email below. The security manager will authorize access recovery routes.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Business Email Address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={recoveryEmailInput}
                            onChange={e => setRecoveryEmailInput(e.target.value)}
                            className="w-full text-sm bg-[#081226] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                            placeholder="e.g. owner@zanzibartripandrelax.com"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                      >
                        Authorize Recovery Options
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStage('login');
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                        className="w-full text-center text-xs text-slate-400 hover:text-white underline block"
                      >
                        Back to Login
                      </button>
                    </form>
                  )}

                  {recoveryStep === 'verify' && (
                    <div className="space-y-4">
                      {/* Method Selection tab bar */}
                      <div className="grid grid-cols-3 gap-1 bg-[#050E1C] p-1.5 rounded-xl text-[10px] uppercase font-bold text-slate-400 border border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setRecoveryMethod('email');
                            generateAndSendRecoveryCode('email', activeOwnerObj);
                          }}
                          className={`py-1.5 px-2 text-center rounded-lg ${recoveryMethod === 'email' ? 'bg-[#D4A017] text-[#020C1F]' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                          Primary Email
                        </button>
                        <button
                          type="button"
                          disabled={!activeOwnerObj.recoveryPhone}
                          onClick={() => {
                            setRecoveryMethod('phone');
                            generateAndSendRecoveryCode('phone', activeOwnerObj);
                          }}
                          className={`py-1.5 px-2 text-center rounded-lg disabled:opacity-30 ${recoveryMethod === 'phone' ? 'bg-[#D4A017] text-[#020C1F]' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                          Recovery Phone
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRecoveryMethod('questions');
                            setAuthError('');
                            setAuthSuccess('Please answer your questions exactly as defined.');
                          }}
                          className={`py-1.5 px-2 text-center rounded-lg ${recoveryMethod === 'questions' ? 'bg-[#D4A017] text-[#020C1F]' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                          Questions
                        </button>
                      </div>

                      {/* Code verification forms */}
                      {(recoveryMethod === 'email' || recoveryMethod === 'phone') ? (
                        <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider font-mono text-center">
                              Enter Recovery Code
                            </label>
                            <div className="relative">
                              <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                              <input
                                type="text"
                                required
                                value={inputRecoveryCode}
                                onChange={e => setInputRecoveryCode(e.target.value.toUpperCase())}
                                className="w-full text-sm bg-[#081226] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white text-center font-mono focus:outline-none focus:border-[#D4A017] tracking-[0.25em]"
                                placeholder="RST-XXXXXX"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                          >
                            Verify Code & Continue
                          </button>

                          <button
                            type="button"
                            disabled={resendCountdown > 0 || authLoading}
                            onClick={() => generateAndSendRecoveryCode(recoveryMethod!, activeOwnerObj)}
                            className="w-full text-center text-xs text-[#D4A017] hover:underline block font-semibold disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                          >
                            {resendCountdown > 0 ? `Resend Code (${resendCountdown}s)` : 'Resend Code'}
                          </button>
                        </form>
                      ) : (
                        /* SECURITY QUESTIONS INPUTS */
                        <form onSubmit={handleVerifySecurityQuestions} className="space-y-4">
                          <div className="space-y-3 bg-white/5 p-4 rounded-2xl">
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase">Q1: {ownerSecurityQuestions[0]?.q}</label>
                              <input
                                type="text"
                                required
                                value={qAnswer1}
                                onChange={e => setQAnswer1(e.target.value)}
                                className="w-full text-xs bg-[#050D1C] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] font-medium"
                                placeholder="Your Answer"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase">Q2: {ownerSecurityQuestions[1]?.q}</label>
                              <input
                                type="text"
                                required
                                value={qAnswer2}
                                onChange={e => setQAnswer2(e.target.value)}
                                className="w-full text-xs bg-[#050D1C] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] font-medium"
                                placeholder="Your Answer"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase">Q3: {ownerSecurityQuestions[2]?.q}</label>
                              <input
                                type="text"
                                required
                                value={qAnswer3}
                                onChange={e => setQAnswer3(e.target.value)}
                                className="w-full text-xs bg-[#050D1C] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] font-medium"
                                placeholder="Your Answer"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                          >
                            Verify Security Answers
                          </button>
                        </form>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryStep('email_input');
                          setRecoveryMethod(null);
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                        className="w-full text-center text-xs text-slate-400 hover:text-white underline block"
                      >
                        Change Recovery Email
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* RESET PASSWORD VIEW */}
              {currentStage === 'reset_password' && (
                <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                  <div className="bg-emerald-600/10 border border-emerald-600/25 p-4 rounded-xl text-xs text-slate-350 space-y-1">
                    <p className="font-bold text-emerald-400">🛡️ Access Authorized</p>
                    <p>Establish a brand new secure master administrator password below to regain full console permissions.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">New Master Password</label>
                    <div className="relative">
                      {showNewPassword ? (
                        <EyeOff size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowNewPassword(false)} />
                      ) : (
                        <EyeIcon size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowNewPassword(true)} />
                      )}
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full text-sm bg-[#081226] border border-white/15 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                        placeholder="Min 8 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Confirm New Master Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        className="w-full text-sm bg-[#081226] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                        placeholder="Confirm new master password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                  >
                    {authLoading ? 'Establishing credentials...' : 'Activate New Credentials'}
                  </button>
                </form>
              )}
            </div>
          )}

          <button 
            onClick={() => navigate('home')} 
            className="mt-4 mx-auto block text-xs font-bold text-slate-400 hover:text-white transition-all underline cursor-pointer"
          >
            ← Back to Public Website
          </button>
        </div>

        {/* LIVE SYSTEM EMAIL LOGS CONSOLE PANEL */}
        <div className="bg-[#050F1E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#08152B] border-b border-white/5 py-3 px-4 flex justify-between items-center select-none">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[#D4A017]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">Live Simulated Mailbox Console</span>
            </div>
            <button
              type="button"
              onClick={() => setShowEmailLogsDrawer(p => !p)}
              className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-slate-300 font-semibold font-mono"
            >
              {showEmailLogsDrawer ? 'Collapse' : 'Expand Logs'}
            </button>
          </div>

          {showEmailLogsDrawer && (
            <div className="p-4 space-y-3 max-h-56 overflow-y-auto font-mono text-[9px] divide-y divide-white/5">
              {emailLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No email logs captured in this session. Dispatching tokens/passcodes registers live mail events here immediately.</p>
              ) : (
                emailLogs.map((log) => (
                  <div key={log.id} className="pt-2 first:pt-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[#D4A017] font-bold">To: {log.to}</span>
                      <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-350 bg-black/30 p-2 rounded border border-white/5 font-semibold">
                      <span className="text-slate-450 uppercase block text-[8px] text-slate-400 mb-0.5">Template: {log.template}</span>
                      <pre className="whitespace-pre-wrap font-sans text-[10px] leading-relaxed text-slate-300">
                        {log.template === 'verification' && `Verification Token: ${log.data.token}`}
                        {log.template === 'two_factor_auth' && `Two-Factor Code (2FA): ${log.data.code}`}
                        {log.template === 'password_reset' && `Password Reset Verification Code: ${log.data.code}`}
                        {log.template === 'sms_dispatch_log' && `${log.data.message}`}
                        {log.template === 'security_alert' && `${log.data.message}`}
                        {!['verification', 'two_factor_auth', 'password_reset', 'sms_dispatch_log', 'security_alert'].includes(log.template) && JSON.stringify(log.data, null, 1)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
