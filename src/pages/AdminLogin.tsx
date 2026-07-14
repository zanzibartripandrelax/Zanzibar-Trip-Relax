import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion } from 'motion/react';
import { 
  Lock, User, Eye, EyeOff, ShieldAlert, CheckCircle2, 
  Mail, ShieldCheck, Globe, Phone, KeyRound, HelpCircle, 
  ChevronRight, ArrowLeft, Send, Check
} from 'lucide-react';
import { addActivityLog } from '../lib/cmsStore';
import { dispatchAutomatedEmail, getEmailLogs } from '../lib/emailService';

interface AdminLoginProps {
  navigate: (page: Page) => void;
}

export default function AdminLogin({ navigate }: AdminLoginProps) {
  // Navigation / Auth States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Flow control
  // loginStage: 'login' | 'complete_profile' | 'security_questions' | 'recover_select' | 'recover_questions' | 'recover_otp' | 'reset_password'
  const [loginStage, setLoginStage] = useState<'login' | 'complete_profile' | 'security_questions' | 'recover_select' | 'recover_questions' | 'recover_otp' | 'reset_password'>('login');
  const [pendingUser, setPendingUser] = useState<any | null>(null);

  // --- Profile Completion States ---
  const [profFullName, setProfFullName] = useState('');
  const [profUsername, setProfUsername] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profRecoveryEmail, setProfRecoveryEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profCountry, setProfCountry] = useState('Tanzania');
  const [profPassword, setProfPassword] = useState('');
  const [profConfirmPassword, setProfConfirmPassword] = useState('');
  const [showProfPass, setShowProfPass] = useState(false);

  // --- Security Questions Setup States ---
  const [q1Sel, setQ1Sel] = useState('What was your first school?');
  const [q1Custom, setQ1Custom] = useState('');
  const [q1Ans, setQ1Ans] = useState('');

  const [q2Sel, setQ2Sel] = useState("What is your mother's middle name?");
  const [q2Custom, setQ2Custom] = useState('');
  const [q2Ans, setQ2Ans] = useState('');

  const [q3Sel, setQ3Sel] = useState('What city were you born in?');
  const [q3Custom, setQ3Custom] = useState('');
  const [q3Ans, setQ3Ans] = useState('');

  // --- Forgot Password Recovery States ---
  const [recoverInput, setRecoverInput] = useState(''); // Email or Username input
  const [selectedRecoveryMethod, setSelectedRecoveryMethod] = useState<'questions' | 'email' | 'phone' | null>(null);
  
  // Verification states
  const [sentCode, setSentCode] = useState('');
  const [sentCodeTarget, setSentCodeTarget] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [inputCode, setInputCode] = useState('');
  const [qVerifyAns1, setQVerifyAns1] = useState('');
  const [qVerifyAns2, setQVerifyAns2] = useState('');
  const [qVerifyAns3, setQVerifyAns3] = useState('');

  // New Password State after recovery
  const [recovNewPass, setRecovNewPass] = useState('');
  const [recovConfirmPass, setRecovConfirmPass] = useState('');
  const [showRecovPass, setShowRecovPass] = useState(false);

  // Live Mailbox & SMS simulated console state
  const [liveLogs, setLiveLogs] = useState<any[]>([]);

  // Default dropdown questions
  const prebuiltQuestions = [
    'What was your first school?',
    "What is your mother's middle name?",
    'What city were you born in?',
    'What was the name of your first childhood pet?',
    'In what city did your parents meet?',
    'What was the make and model of your first car?',
    'Write custom question...'
  ];

  const countriesList = [
    'Tanzania', 'Zanzibar', 'Kenya', 'Uganda', 'United States', 
    'United Kingdom', 'Germany', 'Italy', 'France', 'South Africa', 
    'Oman', 'United Arab Emirates', 'Canada', 'Australia'
  ];

  // SHA-256 secure hash helper
  const sha256 = async (string: string) => {
    const utf8 = new TextEncoder().encode(string.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Load live system email logs for development preview
  const refreshLiveLogs = () => {
    try {
      setLiveLogs(getEmailLogs().slice(-6).reverse());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Seed staff users list if not found or ensure default admin exists
    let usersStr = localStorage.getItem('ztr_admin_users');
    let usersList = usersStr ? JSON.parse(usersStr) : [];
    
    // Check if default admin exists
    const adminExists = usersList.some((u: any) => u.username === 'admin');
    if (!adminExists) {
      const defaultUsers = [
        { 
          username: 'admin', 
          passwordHash: '2407f423605285807b14cc31a9785002719f8982c730cbabcfbd2f61bcfe8306', // SHA-256 for admin123
          name: 'Chief Administrator', 
          role: 'Super Admin', 
          email: 'admin@zanzibar.com', 
          status: 'Active', 
          verified: true,
          requirePasswordChange: true // First-login trigger
        },
        { 
          username: 'manager', 
          passwordHash: '322f98f6d72d24249a15cd388f8d9516ca4d0b13cf3e3b0e13915bc5fcf7ca6c', 
          name: 'Manager Amin', 
          role: 'Manager', 
          email: 'manager@zanzibar.com', 
          status: 'Active', 
          verified: true 
        },
        { 
          username: 'sales', 
          passwordHash: '4f4fa1da80a9693e5066922cfb9b47e5ed7a1262d4e8b394efdc2fbf8ca58ea6', 
          name: 'Sales Rep Salma', 
          role: 'Sales', 
          email: 'sales@zanzibar.com', 
          status: 'Active', 
          verified: true 
        },
        { 
          username: 'accountant', 
          passwordHash: '20eb81ec7d9834cbd2d8d87948cd122c81fb392a2a0ff9bb86cc5b1d4ef23b8f', 
          name: 'Frank Accountant', 
          role: 'Accountant', 
          email: 'accountant@zanzibar.com', 
          status: 'Active', 
          verified: true 
        }
      ];
      localStorage.setItem('ztr_admin_users', JSON.stringify(defaultUsers));
    }

    refreshLiveLogs();
    const handleDispatched = () => refreshLiveLogs();
    window.addEventListener('ztr_email_dispatched', handleDispatched);
    return () => {
      window.removeEventListener('ztr_email_dispatched', handleDispatched);
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

  // Handle core staff authentication login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!username.trim() || !password) {
      setAuthError('Please input valid workstation credentials.');
      return;
    }

    setAuthLoading(true);
    try {
      const inputHash = await sha256(password);
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      
      const userProfile = storedUsers.find(
        (u: any) => 
          u.username.toLowerCase() === username.trim().toLowerCase() || 
          (u.email && u.email.toLowerCase() === username.trim().toLowerCase())
      );

      if (userProfile) {
        if (userProfile.role === 'Owner') {
          setAuthError('Owners must utilize the Master Owner Portal page.');
          setAuthLoading(false);
          return;
        }

        // Check system-owner lock duration
        const lockoutTime = localStorage.getItem('ztr_lockout_until_' + userProfile.username);
        if (lockoutTime && parseInt(lockoutTime) > Date.now()) {
          const diff = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000 / 60);
          setAuthError(`This staff workstation is locked due to security attempts. Retry in ${diff} min.`);
          setAuthLoading(false);
          return;
        }

        if (userProfile.isLocked || userProfile.status === 'Locked' || userProfile.status === 'Inactive') {
          setAuthError('This staff account has been suspended by the workspace owners.');
          setAuthLoading(false);
          return;
        }

        if (userProfile.passwordHash === inputHash) {
          // Reset lockout attempts
          localStorage.removeItem('ztr_failed_attempts_' + userProfile.username);
          localStorage.removeItem('ztr_lockout_until_' + userProfile.username);

          // Force Profile Completion & Security Setup if flagged or if missing security questions
          // DEV BYPASS: Skip mandatory profile completion if VITE_AUTH_BYPASS_VERIFICATION is enabled in dev.
          // To re-enable verification: Set VITE_AUTH_BYPASS_VERIFICATION=false in .env or disable DEV mode.
          const isBypassActive = import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS_VERIFICATION === 'true';
          
          if (!isBypassActive && (userProfile.requirePasswordChange || !userProfile.profileCompleted || !userProfile.securityQuestions)) {
            setPendingUser(userProfile);
            
            // Prefill completion states
            setProfFullName(userProfile.name || '');
            setProfUsername(userProfile.username || '');
            setProfEmail(userProfile.email || '');
            setProfRecoveryEmail(userProfile.recoveryEmail || '');
            setProfPhone(userProfile.phone || '');
            setProfCountry(userProfile.country || 'Tanzania');

            setLoginStage('complete_profile');
            setAuthSuccess('First-time login detected. Secure profile configuration required.');
            setAuthLoading(false);
            return;
          }

          // Complete login session establishment
          establishStaffSession(userProfile);
        } else {
          // Bad password attempt lockout mechanism
          let attempts = parseInt(localStorage.getItem('ztr_failed_attempts_' + userProfile.username) || '0') + 1;
          localStorage.setItem('ztr_failed_attempts_' + userProfile.username, attempts.toString());

          if (attempts >= 5) {
            localStorage.setItem('ztr_lockout_until_' + userProfile.username, (Date.now() + 15 * 60 * 1000).toString());
            addActivityLog('System Security', 'accountLocked', `Staff account [${userProfile.username}] locked for 15 minutes due to 5 consecutive failed login attempts.`);
            setAuthError('Account is locked for 15 minutes due to too many failed security logins.');
          } else {
            setAuthError(`Invalid secure password. Attempt ${attempts} of 5 before workstation lockout.`);
          }
        }
      } else {
        setAuthError('No active staff member found matching this email or username.');
      }
    } catch (err: any) {
      setAuthError('Error authenticating secure portal: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const establishStaffSession = (usr: any) => {
    const userInfo = {
      username: usr.username,
      name: usr.name,
      role: usr.role,
      email: usr.email || '',
      phone: usr.phone || '',
      company: 'Zanzibar Trip & Relax'
    };

    localStorage.setItem('ztr_active_session', JSON.stringify({
      user: userInfo,
      timestamp: Date.now()
    }));

    addActivityLog(usr.name, 'loggedIn', `Logged into ERP console successfully as ${usr.role}.`);
    setAuthSuccess(`Welcome back, ${usr.name}. Initializing authorized workspace...`);

    setTimeout(() => {
      navigate('admin/dashboard');
    }, 1500);
  };

  // Submit Step 1 of Profile Completion Wizard
  const handleProfileStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!profFullName.trim() || !profUsername.trim() || !profEmail.trim() || !profRecoveryEmail.trim() || !profPhone.trim()) {
      setAuthError('All profile metadata fields are strictly mandatory.');
      return;
    }

    if (profEmail.toLowerCase() === profRecoveryEmail.toLowerCase()) {
      setAuthError('Primary work email and recovery email must be distinct for security.');
      return;
    }

    if (!profPassword || !profConfirmPassword) {
      setAuthError('You must define a new secure master password.');
      return;
    }

    if (profPassword !== profConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (profPassword.length < 8) {
      setAuthError('Security Constraint: Passwords must contain at least 8 characters.');
      return;
    }

    // Proceed to Step 2: Security Questions setup
    setLoginStage('security_questions');
    setAuthSuccess('Step 1 complete! Now configure your recovery security questions.');
  };

  // Submit Step 2: Questions Setup and save everything
  const handleSecurityQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    // Formulate questions
    const finalQ1 = q1Sel === 'Write custom question...' ? q1Custom.trim() : q1Sel;
    const finalQ2 = q2Sel === 'Write custom question...' ? q2Custom.trim() : q2Sel;
    const finalQ3 = q3Sel === 'Write custom question...' ? q3Custom.trim() : q3Sel;

    if (!finalQ1 || !finalQ2 || !finalQ3 || !q1Ans.trim() || !q2Ans.trim() || !q3Ans.trim()) {
      setAuthError('You must configure all 3 distinct security questions and answers.');
      setAuthLoading(false);
      return;
    }

    try {
      // Encrypt/Hash the lowercase answers
      const hashA1 = await sha256(q1Ans.toLowerCase());
      const hashA2 = await sha256(q2Ans.toLowerCase());
      const hashA3 = await sha256(q3Ans.toLowerCase());
      const finalPasswordHash = await sha256(profPassword);

      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      const updatedUsers = storedUsers.map((u: any) => {
        if (u.username.toLowerCase() === pendingUser.username.toLowerCase()) {
          return {
            ...u,
            name: profFullName.trim(),
            username: profUsername.trim(),
            email: profEmail.trim(),
            recoveryEmail: profRecoveryEmail.trim(),
            phone: profPhone.trim(),
            country: profCountry,
            passwordHash: finalPasswordHash,
            requirePasswordChange: false,
            profileCompleted: true,
            securityQuestions: [
              { question: finalQ1, answerHash: hashA1 },
              { question: finalQ2, answerHash: hashA2 },
              { question: finalQ3, answerHash: hashA3 }
            ]
          };
        }
        return u;
      });

      localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));
      addActivityLog(profFullName.trim(), 'profileCompleted', 'Completed first-login staff profile setup with security questions.');

      setAuthSuccess('Workstation credentials successfully registered! Logging you in...');
      
      // Establish actual session
      const matchedUser = updatedUsers.find((u: any) => u.username.toLowerCase() === profUsername.trim().toLowerCase());
      setTimeout(() => {
        establishStaffSession(matchedUser);
      }, 1500);

    } catch (err: any) {
      setAuthError('Failed to securely process answers: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Initiate Account Recovery
  const handleInitiateRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!recoverInput.trim()) {
      setAuthError('Please provide your username or primary work email.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const userObj = storedUsers.find(
      (u: any) => 
        u.username.toLowerCase() === recoverInput.trim().toLowerCase() ||
        (u.email && u.email.toLowerCase() === recoverInput.trim().toLowerCase())
    );

    if (!userObj) {
      setAuthError('No active staff member found matching this credential.');
      return;
    }

    setPendingUser(userObj);
    setLoginStage('recover_select');
    setAuthSuccess(`Secure account found for ${userObj.name}. Choose verification method.`);
  };

  // Trigger Recovery Delivery (Email OTP or SMS OTP or Security questions)
  const triggerRecoveryMethod = (method: 'questions' | 'email' | 'phone') => {
    setSelectedRecoveryMethod(method);
    setAuthError('');
    setAuthSuccess('');

    if (method === 'questions') {
      if (!pendingUser.securityQuestions || pendingUser.securityQuestions.length < 3) {
        setAuthError('This account does not have security questions configured. Contact System Administrator.');
        return;
      }
      setLoginStage('recover_questions');
    } else if (method === 'email') {
      // DEV BYPASS: Skip email OTP challenge if VITE_AUTH_BYPASS_VERIFICATION is enabled in dev.
      // To re-enable verification: Set VITE_AUTH_BYPASS_VERIFICATION=false in .env.
      if (import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS_VERIFICATION === 'true') {
        setAuthSuccess('Development Mode Bypass: Email verification challenge skipped.');
        setLoginStage('reset_password');
        return;
      }

      if (!pendingUser.recoveryEmail) {
        setAuthError('No secure recovery backup email configured on this dossier.');
        return;
      }

      setAuthLoading(true);
      setSentCodeTarget(pendingUser.recoveryEmail);

      fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: pendingUser.recoveryEmail,
          type: 'email',
          name: pendingUser.name,
          context: 'recovery'
        })
      })
      .then(async (res) => {
        const data = await res.json();
        setAuthLoading(false);
        if (data.success) {
          setResendCountdown(data.resendInSeconds || 45);
          addActivityLog('System Security', 'recoveryCodeDispatched', `Sent password reset security challenge code to recovery mail of user [${pendingUser.username}].`);
          setAuthSuccess(`Dispatched security reset code to your registered backup email address: ${pendingUser.recoveryEmail}`);
          setLoginStage('recover_otp');
        } else {
          setAuthError(data.error || 'Failed to dispatch security recovery email.');
        }
      })
      .catch((err) => {
        setAuthLoading(false);
        setAuthError('Connection failure: ' + err.message);
      });

    } else if (method === 'phone') {
      // DEV BYPASS: Skip SMS OTP challenge if VITE_AUTH_BYPASS_VERIFICATION is enabled in dev.
      // To re-enable verification: Set VITE_AUTH_BYPASS_VERIFICATION=false in .env.
      if (import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS_VERIFICATION === 'true') {
        setAuthSuccess('Development Mode Bypass: SMS verification challenge skipped.');
        setLoginStage('reset_password');
        return;
      }

      if (!pendingUser.phone) {
        setAuthError('No secure mobile contact registered on this staff dossier.');
        return;
      }

      setAuthLoading(true);
      setSentCodeTarget(pendingUser.phone);

      fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: pendingUser.phone,
          type: 'phone',
          name: pendingUser.name,
          context: 'recovery'
        })
      })
      .then(async (res) => {
        const data = await res.json();
        setAuthLoading(false);
        if (data.success) {
          setResendCountdown(data.resendInSeconds || 45);
          addActivityLog('System Security', 'recoverySmsDispatched', `Sent SMS recovery code to mobile number of user [${pendingUser.username}].`);
          setAuthSuccess(`Dispatched security SMS verification code to mobile number: ${pendingUser.phone}`);
          setLoginStage('recover_otp');
        } else {
          setAuthError(data.error || 'Failed to dispatch SMS verification code.');
        }
      })
      .catch((err) => {
        setAuthLoading(false);
        setAuthError('Connection failure: ' + err.message);
      });
    }
  };

  // Verify Security Question Answers
  const handleVerifyQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const storedQuestions = pendingUser.securityQuestions;
      
      const hashInput1 = await sha256(qVerifyAns1.toLowerCase());
      const hashInput2 = await sha256(qVerifyAns2.toLowerCase());
      const hashInput3 = await sha256(qVerifyAns3.toLowerCase());

      const match1 = hashInput1 === storedQuestions[0].answerHash;
      const match2 = hashInput2 === storedQuestions[1].answerHash;
      const match3 = hashInput3 === storedQuestions[2].answerHash;

      if (match1 && match2 && match3) {
        setAuthSuccess('Security verification approved! Please configure your new master password.');
        setLoginStage('reset_password');
      } else {
        // Log attempt
        addActivityLog('System Security', 'failedQuestionsVerification', `Failed security questions match attempt for user [${pendingUser.username}].`);
        setAuthError('Answers do not match our database records. Please double check capitalization & spacing.');
      }
    } catch (err: any) {
      setAuthError('Verification error: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Verify OTP Code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: sentCodeTarget,
          code: inputCode.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setAuthSuccess('Security verification approved! Configure your new workstation password.');
        setLoginStage('reset_password');
      } else {
        setAuthError(data.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setAuthError('Verification error: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Save the new password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!recovNewPass || !recovConfirmPass) {
      setAuthError('All password fields are strictly mandatory.');
      return;
    }

    if (recovNewPass !== recovConfirmPass) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (recovNewPass.length < 8) {
      setAuthError('Passwords must contain at least 8 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const newHash = await sha256(recovNewPass);
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      
      const updatedUsers = storedUsers.map((u: any) => {
        if (u.username.toLowerCase() === pendingUser.username.toLowerCase()) {
          return {
            ...u,
            passwordHash: newHash,
            requirePasswordChange: false // password resets clear password change flag
          };
        }
        return u;
      });

      localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));
      addActivityLog(pendingUser.name, 'passwordRecovered', 'Successfully reset workstation credentials using recovery flow.');

      setAuthSuccess('Secure credentials updated! Directing you to workstation entry login...');
      
      setTimeout(() => {
        setLoginStage('login');
        setUsername(pendingUser.username);
        setPassword('');
        setPendingUser(null);
        setAuthSuccess('Credentials updated! Enter your new password to login.');
      }, 2000);

    } catch (err: any) {
      setAuthError('Failed to encrypt password: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070E1A] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      {/* Decorative blurred backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0B3B8C] rounded-full filter blur-[150px] opacity-20 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#D4A017] rounded-full filter blur-[180px] opacity-10 pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10 my-8">
        <div className="bg-[#0A1224] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Top Brand Branding */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-[#0B3B8C]/15 border border-[#D4A017]/25 rounded-full flex items-center justify-center mb-1">
              <ShieldCheck className="w-8 h-8 text-[#D4A017]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Staff Workstation
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase font-mono">
              Zanzibar Trip & Relax ERP Secure Authorization
            </p>
          </div>

          {/* Feedback banners */}
          {authError && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-300 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in">
              <ShieldAlert size={14} className="shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* --- STAGE: LOGIN --- */}
          {loginStage === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Work Email Address / Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-medium"
                    placeholder="e.g. manager"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Secure Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStage('recover_select');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-xs text-[#D4A017] hover:underline hover:text-[#b8860b] font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  {showPassword ? (
                    <EyeOff size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer z-10" onClick={() => setShowPassword(false)} />
                  ) : (
                    <Eye size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer z-10" onClick={() => setShowPassword(true)} />
                  )}
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#D4A017]/10"
              >
                {authLoading ? 'Verifying Workstation Safe Session...' : 'Authenticate Workstation'}
              </button>
            </form>
          )}

          {/* --- STAGE: FIRST LOGIN PROFILE COMPLETION WIZARD (STEP 1) --- */}
          {loginStage === 'complete_profile' && pendingUser && (
            <form onSubmit={handleProfileStepSubmit} className="space-y-5 animate-fade-in">
              <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 p-4 rounded-xl text-xs text-slate-300 space-y-1">
                <p className="font-bold text-[#D4A017] flex items-center gap-1.5">
                  <ShieldCheck size={14} /> 
                  Mandatory Security Clearance: Complete Profile (Step 1 of 2)
                </p>
                <p>This is your first login using temporary setup credentials. You must review and complete your security dossier prior to accessing the system.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={profFullName}
                    onChange={e => setProfFullName(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Workstation Username</label>
                  <input
                    type="text"
                    required
                    value={profUsername}
                    onChange={e => setProfUsername(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Primary Work Email</label>
                  <input
                    type="email"
                    required
                    value={profEmail}
                    onChange={e => setProfEmail(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Demographic Country</label>
                  <select
                    value={profCountry}
                    onChange={e => setProfCountry(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                  >
                    {countriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure Backup Recovery Email</label>
                  <input
                    type="email"
                    required
                    placeholder="For security link/OTP recovery"
                    value={profRecoveryEmail}
                    onChange={e => setProfRecoveryEmail(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mobile Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +255 777 000 000"
                    value={profPhone}
                    onChange={e => setProfPhone(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Role Permission (Read-Only)</label>
                  <input
                    type="text"
                    readOnly
                    value={pendingUser.role}
                    className="w-full text-sm bg-white/5 border border-white/5 rounded-xl py-2 px-3 text-slate-400 font-bold uppercase"
                  />
                </div>

                <div className="space-y-1" />

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Create New Password</label>
                  <div className="relative">
                    {showProfPass ? (
                      <EyeOff size={14} className="absolute right-3 top-3 text-slate-400 cursor-pointer z-10" onClick={() => setShowProfPass(false)} />
                    ) : (
                      <Eye size={14} className="absolute right-3 top-3 text-slate-400 cursor-pointer z-10" onClick={() => setShowProfPass(true)} />
                    )}
                    <input
                      type={showProfPass ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 characters"
                      value={profPassword}
                      onChange={e => setProfPassword(e.target.value)}
                      className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 pl-3 pr-8 text-white focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type={showProfPass ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={profConfirmPassword}
                    onChange={e => setProfConfirmPassword(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginStage('login');
                    setPendingUser(null);
                    setAuthError('');
                  }}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next: Security Questions</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* --- STAGE: FIRST LOGIN SECURITY QUESTIONS (STEP 2) --- */}
          {loginStage === 'security_questions' && pendingUser && (
            <form onSubmit={handleSecurityQuestionsSubmit} className="space-y-5 animate-fade-in">
              <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 p-4 rounded-xl text-xs text-slate-300 space-y-1">
                <p className="font-bold text-[#D4A017] flex items-center gap-1.5">
                  <HelpCircle size={14} />
                  Configure Emergency Recovery Questions (Step 2 of 2)
                </p>
                <p>Configure exactly three security questions to allow fully offline self-recovery if your password or devices are lost.</p>
              </div>

              {/* Question 1 */}
              <div className="space-y-2 bg-[#121B30]/30 p-4 rounded-2xl border border-white/5">
                <label className="block text-xs font-bold text-[#D4A017] uppercase tracking-wider">Question 1</label>
                <select
                  value={q1Sel}
                  onChange={e => setQ1Sel(e.target.value)}
                  className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                >
                  {prebuiltQuestions.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                {q1Sel === 'Write custom question...' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter your custom question 1 here..."
                    value={q1Custom}
                    onChange={e => setQ1Custom(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] mt-2 animate-fade-in"
                  />
                )}
                <div className="space-y-1 mt-1">
                  <label className="block text-[10px] text-slate-450 uppercase font-semibold">Secret Answer 1 (Hashed)</label>
                  <input
                    type="text"
                    required
                    placeholder="Secret Answer 1"
                    value={q1Ans}
                    onChange={e => setQ1Ans(e.target.value)}
                    className="w-full text-sm bg-[#0A1224] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-2 bg-[#121B30]/30 p-4 rounded-2xl border border-white/5">
                <label className="block text-xs font-bold text-[#D4A017] uppercase tracking-wider">Question 2</label>
                <select
                  value={q2Sel}
                  onChange={e => setQ2Sel(e.target.value)}
                  className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                >
                  {prebuiltQuestions.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                {q2Sel === 'Write custom question...' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter your custom question 2 here..."
                    value={q2Custom}
                    onChange={e => setQ2Custom(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] mt-2 animate-fade-in"
                  />
                )}
                <div className="space-y-1 mt-1">
                  <label className="block text-[10px] text-slate-450 uppercase font-semibold">Secret Answer 2 (Hashed)</label>
                  <input
                    type="text"
                    required
                    placeholder="Secret Answer 2"
                    value={q2Ans}
                    onChange={e => setQ2Ans(e.target.value)}
                    className="w-full text-sm bg-[#0A1224] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-2 bg-[#121B30]/30 p-4 rounded-2xl border border-white/5">
                <label className="block text-xs font-bold text-[#D4A017] uppercase tracking-wider">Question 3</label>
                <select
                  value={q3Sel}
                  onChange={e => setQ3Sel(e.target.value)}
                  className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                >
                  {prebuiltQuestions.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                {q3Sel === 'Write custom question...' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter your custom question 3 here..."
                    value={q3Custom}
                    onChange={e => setQ3Custom(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017] mt-2 animate-fade-in"
                  />
                )}
                <div className="space-y-1 mt-1">
                  <label className="block text-[10px] text-slate-450 uppercase font-semibold">Secret Answer 3 (Hashed)</label>
                  <input
                    type="text"
                    required
                    placeholder="Secret Answer 3"
                    value={q3Ans}
                    onChange={e => setQ3Ans(e.target.value)}
                    className="w-full text-sm bg-[#0A1224] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setLoginStage('complete_profile')}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white underline cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Step 1</span>
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/10"
                >
                  <Check size={14} />
                  <span>{authLoading ? 'Registering Security Questions...' : 'Complete Profile & Setup'}</span>
                </button>
              </div>
            </form>
          )}

          {/* --- RECOVERY STAGE: SELECT MECHANISM --- */}
          {loginStage === 'recover_select' && (
            <div className="space-y-6 animate-fade-in">
              {!pendingUser ? (
                // Step A: Provide Email or Username
                <form onSubmit={handleInitiateRecovery} className="space-y-4">
                  <div className="bg-[#121B30]/50 border border-white/5 p-4 rounded-xl text-xs text-slate-400">
                    <p>Provide your registered Workstation Username or Primary Business Email. The system security matrix will map your active profile recovery details.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Work Username or Email</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={recoverInput}
                        onChange={e => setRecoverInput(e.target.value)}
                        className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                        placeholder="e.g. manager"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setLoginStage('login')}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-widest"
                    >
                      Find Profile
                    </button>
                  </div>
                </form>
              ) : (
                // Step B: Select Method
                <div className="space-y-4">
                  <div className="bg-[#121B30]/50 border border-white/5 p-4 rounded-xl text-xs space-y-1 text-slate-300">
                    <p className="font-bold text-[#D4A017]">Account recovery is available for {pendingUser.name}</p>
                    <p>Please select your preferred secure verification factor below:</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Method 1: Security Questions */}
                    <button
                      type="button"
                      onClick={() => triggerRecoveryMethod('questions')}
                      className="w-full p-4 rounded-2xl bg-[#0F1D38] hover:bg-[#162A50] border border-white/10 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
                          <HelpCircle size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Answer Security Questions</p>
                          <p className="text-[10px] text-slate-400 font-medium">Verify your pre-configured encrypted security answers offline</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#D4A017]" />
                    </button>

                    {/* Method 2: Recovery Email Code */}
                    <button
                      type="button"
                      onClick={() => triggerRecoveryMethod('email')}
                      className="w-full p-4 rounded-2xl bg-[#0F1D38] hover:bg-[#162A50] border border-white/10 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Backup Recovery Email Code</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Send safety code to: {pendingUser.recoveryEmail ? `${pendingUser.recoveryEmail.substr(0, 3)}••••@••••.com` : 'No recovery email set'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#D4A017]" />
                    </button>

                    {/* Method 3: Mobile Phone SMS OTP */}
                    <button
                      type="button"
                      onClick={() => triggerRecoveryMethod('phone')}
                      className="w-full p-4 rounded-2xl bg-[#0F1D38] hover:bg-[#162A50] border border-white/10 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Simulated Mobile SMS OTP</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Send temporary SMS OTP to: {pendingUser.phone ? `••••••${pendingUser.phone.substr(-4)}` : 'No phone number set'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#D4A017]" />
                    </button>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingUser(null);
                        setRecoverInput('');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginStage('login')}
                      className="text-xs text-[#D4A017] hover:underline font-semibold cursor-pointer"
                    >
                      Return to Main Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- RECOVERY STAGE: SECURITY QUESTIONS VERIFICATION --- */}
          {loginStage === 'recover_questions' && pendingUser && (
            <form onSubmit={handleVerifyQuestions} className="space-y-4 animate-fade-in">
              <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 p-4 rounded-xl text-xs text-slate-300">
                <p className="font-bold text-[#D4A017]">Identity Challenge: Answer Security Questions</p>
                <p>Provide the accurate answers configured during profile registration. Security answers are verified case-insensitively.</p>
              </div>

              {pendingUser.securityQuestions?.map((qObj: any, index: number) => (
                <div key={index} className="space-y-1.5 bg-[#121B30]/40 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#D4A017] font-bold block uppercase tracking-wider">Question {index + 1}</span>
                  <p className="text-xs font-bold text-white">{qObj.question}</p>
                  <input
                    type="text"
                    required
                    placeholder="Enter Secret Answer"
                    value={index === 0 ? qVerifyAns1 : index === 1 ? qVerifyAns2 : qVerifyAns3}
                    onChange={e => {
                      if (index === 0) setQVerifyAns1(e.target.value);
                      else if (index === 1) setQVerifyAns2(e.target.value);
                      else setQVerifyAns3(e.target.value);
                    }}
                    className="w-full text-sm bg-[#0C1930] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              ))}

              <div className="flex justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setLoginStage('recover_select')}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  ← Other Methods
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-2 px-6 rounded-xl text-xs uppercase tracking-widest cursor-pointer"
                >
                  Verify Security Answers
                </button>
              </div>
            </form>
          )}

          {/* --- RECOVERY STAGE: OTP CODE VERIFICATION --- */}
          {loginStage === 'recover_otp' && pendingUser && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
              <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 p-4 rounded-xl text-xs text-slate-300">
                <p className="font-bold text-[#D4A017]">Identity Challenge: Code Verification</p>
                <p>Please enter the 6-digit security code dispatched to your chosen recovery channel. Check the simulated log console below.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">6-Digit Security Code</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. RST-123456 or OTP-123456"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white font-mono tracking-widest font-bold focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setLoginStage('recover_select')}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  ← Choose Another Factor
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={resendCountdown > 0 || authLoading}
                    onClick={() => triggerRecoveryMethod(selectedRecoveryMethod!)}
                    className="text-[10px] text-slate-300 border border-white/10 hover:border-white/20 bg-white/5 disabled:opacity-50 hover:bg-white/10 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
                  >
                    {resendCountdown > 0 ? `Resend Code (${resendCountdown}s)` : 'Resend Code'}
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="bg-[#D4A017] hover:bg-[#c39010] disabled:bg-slate-700 text-[#020C1F] font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
                  >
                    {authLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* --- RECOVERY STAGE: RESET PASSWORD --- */}
          {loginStage === 'reset_password' && pendingUser && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-fade-in">
              <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 p-4 rounded-xl text-xs text-slate-300">
                <p className="font-bold text-[#D4A017]">Identity Validated! Configure New Password</p>
                <p>Choose a secure master password containing at least 8 characters. Do not reuse old passwords.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Choose New Password</label>
                <div className="relative">
                  {showRecovPass ? (
                    <EyeOff size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer z-10" onClick={() => setShowRecovPass(false)} />
                  ) : (
                    <Eye size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer z-10" onClick={() => setShowRecovPass(true)} />
                  )}
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showRecovPass ? 'text' : 'password'}
                    required
                    placeholder="Minimum 8 characters"
                    value={recovNewPass}
                    onChange={e => setRecovNewPass(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showRecovPass ? 'text' : 'password'}
                    required
                    placeholder="Confirm password"
                    value={recovConfirmPass}
                    onChange={e => setRecovConfirmPass(e.target.value)}
                    className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
              >
                {authLoading ? 'Registering safe password...' : 'Apply Secure New Password'}
              </button>
            </form>
          )}

          <button 
            onClick={() => navigate('home')} 
            className="mt-4 mx-auto block text-xs font-bold text-slate-400 hover:text-[#D4A017] transition-all underline cursor-pointer"
          >
            ← Back to Public Website
          </button>
        </div>
      </div>

      {/* --- LIVE WORKSPACE NOTIFICATION LOGGER Drawer --- */}
      <div className="max-w-2xl w-full relative z-10 mt-2">
        <div className="bg-[#050B16] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping" />
              <h3 className="text-xs font-black text-[#D4A017] uppercase tracking-widest font-mono">Simulated Terminal Workspace Mailbox & SMS Hub</h3>
            </div>
            <button
              onClick={refreshLiveLogs}
              className="text-[9px] bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded border border-white/5 font-mono cursor-pointer transition-all"
            >
              Refresh Mail/SMS Logs
            </button>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal font-mono">
            <strong>Developer Testing Tool:</strong> In this sandboxed simulation, recovery emails and text OTP tokens bypass real telecom routes and resolve instantly below.
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {liveLogs.length === 0 ? (
              <div className="text-center py-4 text-slate-500 font-mono text-[10px]">
                No dispatched notifications in current local storage. Try triggering a code.
              </div>
            ) : (
              liveLogs.map((log, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#091122] border border-white/5 font-mono text-[10px] text-slate-300 space-y-1 hover:border-white/10 transition-colors">
                  <div className="flex justify-between text-slate-500 text-[9px] border-b border-white/5 pb-1 mb-1 flex-wrap gap-1">
                    <span>⚡ Sent to: <strong className="text-white">{log.recipient}</strong></span>
                    <span>🕒 {new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[#D4A017] font-bold">Subject: {log.subject}</p>
                  <p className="text-slate-400 leading-relaxed break-all font-mono whitespace-pre-wrap">{log.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
