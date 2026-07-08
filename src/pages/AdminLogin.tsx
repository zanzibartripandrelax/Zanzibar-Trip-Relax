import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion } from 'motion/react';
import { 
  Lock, User, Eye, EyeOff, ShieldAlert, CheckCircle2, 
  Mail, ShieldCheck 
} from 'lucide-react';
import { addActivityLog } from '../lib/cmsStore';

interface AdminLoginProps {
  navigate: (page: Page) => void;
}

export default function AdminLogin({ navigate }: AdminLoginProps) {
  // Login inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // First-login password change states
  const [loginStage, setLoginStage] = useState<'login' | 'change_password'>('login');
  const [pendingUser, setPendingUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Sha256 helper for password checking
  const sha256 = async (string: string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    // Seed staff users list if not found
    let users = localStorage.getItem('ztr_admin_users');
    if (!users) {
      const defaultUsers = [
        { username: 'manager', passwordHash: '322f98f6d72d24249a15cd388f8d9516ca4d0b13cf3e3b0e13915bc5fcf7ca6c', name: 'Manager Amin', role: 'Manager', email: 'manager@zanzibar.com', status: 'Active', verified: true },
        { username: 'sales', passwordHash: '4f4fa1da80a9693e5066922cfb9b47e5ed7a1262d4e8b394efdc2fbf8ca58ea6', name: 'Sales Rep Salma', role: 'Sales', email: 'sales@zanzibar.com', status: 'Active', verified: true },
        { username: 'accountant', passwordHash: '20eb81ec7d9834cbd2d8d87948cd122c81fb392a2a0ff9bb86cc5b1d4ef23b8f', name: 'Frank accountant', role: 'Accountant', email: 'accountant@zanzibar.com', status: 'Active', verified: true },
        { username: 'marketing', passwordHash: '36113bdf2292f39cbf8f8515c61a153835e5d1e2e92bc49692c81358d7e0099e', name: 'Neema Marketing', role: 'Marketing', email: 'marketing@zanzibar.com', status: 'Active', verified: true },
        { username: 'guide', passwordHash: '2a28178a9c2401f8df9765e90eb21ddb97b1ca6dcff7cedc2826cf8438db06ff', name: 'Captain Guide Ali', role: 'Guide', email: 'guide@zanzibar.com', status: 'Active', verified: true },
        { username: 'driver', passwordHash: '0142fa9559c5d0130db99e3ca893b86cb45e05d0e2e987f73967d1db0e987be7', name: 'Driver Juma', role: 'Driver', email: 'driver@zanzibar.com', status: 'Active', verified: true }
      ];
      localStorage.setItem('ztr_admin_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!username.trim() || !password) {
      setAuthError('Please fill in secure staff credentials.');
      return;
    }

    setAuthLoading(true);
    try {
      const inputHash = await sha256(password);
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      
      // Find the user first to track failed logins
      const userProfile = storedUsers.find(
        (u: any) => 
          u.username.toLowerCase() === username.trim().toLowerCase() || 
          (u.email && u.email.toLowerCase() === username.trim().toLowerCase())
      );

      if (userProfile) {
        if (userProfile.role === 'Owner') {
          setAuthError('Owners must use the secure Owner Login page.');
          setAuthLoading(false);
          return;
        }

        // Check lockout duration
        const lockoutTime = localStorage.getItem('ztr_lockout_until_' + userProfile.username);
        if (lockoutTime && parseInt(lockoutTime) > Date.now()) {
          const diff = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000 / 60);
          setAuthError(`This staff account is locked due to repeated failed logins. Please try again in ${diff} minute(s).`);
          setAuthLoading(false);
          return;
        }

        if (userProfile.isLocked || userProfile.status === 'Locked') {
          setAuthError('This staff account has been locked by the system owner.');
          setAuthLoading(false);
          return;
        }

        if (userProfile.passwordHash === inputHash) {
          // Success! Clear failed attempts
          localStorage.removeItem('ztr_failed_attempts_' + userProfile.username);
          localStorage.removeItem('ztr_lockout_until_' + userProfile.username);

          // Force password update if flagged
          if (userProfile.requirePasswordChange) {
            setPendingUser(userProfile);
            setLoginStage('change_password');
            setAuthSuccess('First-time login detected. You must change your temporary password.');
            setAuthLoading(false);
            return;
          }

          const userInfo = {
            username: userProfile.username,
            name: userProfile.name,
            role: userProfile.role,
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            company: userProfile.company || 'Zanzibar Trip & Relax'
          };

          localStorage.setItem('ztr_active_session', JSON.stringify({
            user: userInfo,
            timestamp: Date.now()
          }));

          addActivityLog(
            userProfile.name, 
            'loggedIn', 
            `Logged into ERP dashboard successfully as ${userProfile.role}.`
          );

          setAuthSuccess(`Welcome back, ${userProfile.name}. Role: ${userProfile.role}`);

          // Redirect to admin/dashboard
          setTimeout(() => {
            navigate('admin/dashboard');
          }, 1500);
        } else {
          // Failed password
          let attempts = parseInt(localStorage.getItem('ztr_failed_attempts_' + userProfile.username) || '0') + 1;
          localStorage.setItem('ztr_failed_attempts_' + userProfile.username, attempts.toString());

          if (attempts >= 5) {
            localStorage.setItem('ztr_lockout_until_' + userProfile.username, (Date.now() + 15 * 60 * 1000).toString());
            addActivityLog('System Security', 'accountLocked', `Staff account [${userProfile.username}] locked due to 5 consecutive failed login attempts.`);
            setAuthError('This account is now locked for 15 minutes due to too many failed login attempts.');
          } else {
            setAuthError(`Invalid secure password. Attempt ${attempts} of 5 before account lockout.`);
          }
        }
      } else {
        setAuthError('No active staff member found with this username or work email.');
      }
    } catch (err: any) {
      setAuthError('Error authenticating secure portal: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!newPasswordInput || !confirmPasswordInput) {
      setAuthError('Please fill in all secure password fields.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (newPasswordInput.length < 8) {
      setAuthError('Secure password must be at least 8 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const hashedPass = await sha256(newPasswordInput);
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      
      const updatedUsers = storedUsers.map((u: any) => {
        if (u.username.toLowerCase() === pendingUser.username.toLowerCase()) {
          return {
            ...u,
            passwordHash: hashedPass,
            requirePasswordChange: false
          };
        }
        return u;
      });

      localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));
      addActivityLog(pendingUser.name, 'passwordChanged', 'Staff password changed successfully from temporary key on first login.');

      setAuthSuccess('Credentials updated successfully! Establishing secure workstation session...');

      const userInfo = {
        username: pendingUser.username,
        name: pendingUser.name,
        role: pendingUser.role,
        email: pendingUser.email || '',
        phone: pendingUser.phone || '',
        company: pendingUser.company || 'Zanzibar Trip & Relax'
      };

      localStorage.setItem('ztr_active_session', JSON.stringify({
        user: userInfo,
        timestamp: Date.now()
      }));

      setTimeout(() => {
        navigate('admin/dashboard');
      }, 1500);
    } catch (err: any) {
      setAuthError('Failed to change password: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070E1A] flex items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0B3B8C] rounded-full filter blur-[150px] opacity-20 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#D4A017] rounded-full filter blur-[180px] opacity-10 pointer-events-none" />

      <div className="max-w-md w-full relative z-10 my-8">
        <div className="bg-[#0A1224] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          
          {/* Top Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-[#0B3B8C]/15 border border-[#D4A017]/25 rounded-full flex items-center justify-center mb-2">
              <ShieldCheck className="w-8 h-8 text-[#D4A017]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-serif">
              Staff Portal
            </h1>
            <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase font-mono">
              Workstation Authorization
            </p>
          </div>

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

            {loginStage === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Work Email Address / Username</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-medium font-sans"
                      placeholder="e.g. manager@zanzibar.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Secure Password</label>
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
                  {authLoading ? 'Verifying Safe Session...' : 'Authenticate Securely'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 p-4 rounded-xl text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-[#D4A017]">🔒 Security Mandate: Change Password</p>
                  <p>This is your first login with temporary credentials. You must create a new secure password to activate your workstation account.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    {showNewPassword ? (
                      <EyeOff size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowNewPassword(false)} />
                    ) : (
                      <Eye size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowNewPassword(true)} />
                    )}
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmPasswordInput}
                      onChange={e => setConfirmPasswordInput(e.target.value)}
                      className="w-full text-sm bg-[#0C1930] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  {authLoading ? 'Updating credentials...' : 'Establish Secure Credentials'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginStage('login');
                    setPendingUser(null);
                    setAuthError('');
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white underline block pt-1 cursor-pointer"
                >
                  Cancel and Back to Login
                </button>
              </form>
            )}
          </div>

          <button 
            onClick={() => navigate('home')} 
            className="mt-4 mx-auto block text-xs font-bold text-slate-400 hover:text-white transition-all underline"
          >
            ← Back to Public Website
          </button>
        </div>
      </div>
    </div>
  );
}
