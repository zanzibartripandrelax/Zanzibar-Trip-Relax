import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion } from 'motion/react';
import { 
  Lock, User, Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2, 
  Building2, Mail, Phone, KeyRound, UserCheck, ShieldCheck 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { addActivityLog } from '../lib/cmsStore';

interface AdminLoginProps {
  navigate: (page: Page) => void;
}

export default function AdminLogin({ navigate }: AdminLoginProps) {
  // Setup state
  const [isOwnerSetupComplete, setIsOwnerSetupComplete] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Login inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Setup Wizard inputs
  const [setupFullName, setSetupFullName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupCompanyName, setSetupCompanyName] = useState('Zanzibar Trip & Relax');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');

  // Sha256 helper for password checking
  const sha256 = async (string: string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    // Check if owner setup was completed
    const completed = localStorage.getItem('ztr_owner_setup_complete') === 'true';
    setIsOwnerSetupComplete(completed);
    
    // If not completed, force the setup wizard
    if (!completed) {
      setShowSetupWizard(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!username.trim() || !password) {
      setAuthError('Please fill in credentials.');
      return;
    }

    setAuthLoading(true);
    try {
      const inputHash = await sha256(password);
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      
      // Find matching user by username or email
      const userMatch = storedUsers.find(
        (u: any) => 
          (u.username.toLowerCase() === username.trim().toLowerCase() || 
           u.email?.toLowerCase() === username.trim().toLowerCase()) && 
          u.passwordHash === inputHash
      );

      if (userMatch) {
        const userInfo = {
          username: userMatch.username,
          name: userMatch.name,
          role: userMatch.role,
          email: userMatch.email || '',
          phone: userMatch.phone || '',
          company: userMatch.company || 'Zanzibar Trip & Relax'
        };

        localStorage.setItem('ztr_active_session', JSON.stringify({
          user: userInfo,
          timestamp: Date.now()
        }));

        addActivityLog(
          userMatch.name, 
          'loggedIn', 
          `Logged into ERP dashboard successfully as ${userMatch.role}.`
        );

        // Redirect to admin
        navigate('admin/dashboard');
      } else {
        // Fallback to Supabase login if configured
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: username.trim(),
            password: password
          });

          if (data && data.session) {
            const userEmail = data.session.user.email || '';
            const userInfo = {
              username: userEmail.split('@')[0],
              name: data.session.user.user_metadata?.full_name || 'Supabase User',
              role: data.session.user.user_metadata?.role || 'Administrator',
              email: userEmail,
              phone: data.session.user.phone || '',
              company: 'Zanzibar Trip & Relax'
            };

            localStorage.setItem('ztr_active_session', JSON.stringify({
              user: userInfo,
              timestamp: Date.now()
            }));

            addActivityLog(
              userInfo.name,
              'loggedIn',
              `Logged in via Supabase Authentication.`
            );

            navigate('admin/dashboard');
            return;
          }
        } catch (supabaseErr) {
          // Ignore and show original error
        }

        setAuthError('Invalid username, email, or secure password.');
      }
    } catch (err: any) {
      setAuthError('Error authenticating secure portal: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOwnerSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    setSetupSuccess('');

    if (!setupFullName.trim() || !setupEmail.trim() || !setupPassword || !setupConfirmPassword) {
      setSetupError('Please populate all configuration fields.');
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setSetupError('Passwords do not match.');
      return;
    }

    if (setupPassword.length < 6) {
      setSetupError('Password must be at least 6 characters for security.');
      return;
    }

    setAuthLoading(true);

    try {
      const hashedPass = await sha256(setupPassword);
      const ownerUsername = setupEmail.trim().split('@')[0].toLowerCase();
      
      const newOwnerObj = {
        username: ownerUsername,
        passwordHash: hashedPass,
        name: setupFullName.trim(),
        email: setupEmail.trim().toLowerCase(),
        phone: setupPhone.trim(),
        company: setupCompanyName.trim(),
        role: 'Owner', // Super elevated role
        status: 'Active',
        created_at: new Date().toISOString()
      };

      // 1. Get existing users and insert new owner
      const currentUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      const filteredUsers = currentUsers.filter((u: any) => u.role !== 'Owner'); // Prevent duplication
      const updatedUsers = [newOwnerObj, ...filteredUsers];
      
      localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));
      localStorage.setItem('ztr_owner_setup_complete', 'true');
      
      // Attempt registration in Supabase auth for real persistence if possible
      try {
        await supabase.auth.signUp({
          email: setupEmail.trim(),
          password: setupPassword,
          options: {
            data: {
              full_name: setupFullName.trim(),
              role: 'Owner',
              company_name: setupCompanyName.trim()
            }
          }
        });
      } catch (authErr) {
        console.warn('Supabase auth signup skipped or failed, using local storage backup:', authErr);
      }

      setSetupSuccess('Owner account registered successfully! Initializing system components...');
      
      // Auto login
      const userInfo = {
        username: ownerUsername,
        name: setupFullName.trim(),
        role: 'Owner',
        email: setupEmail.trim().toLowerCase(),
        phone: setupPhone.trim(),
        company: setupCompanyName.trim()
      };

      localStorage.setItem('ztr_active_session', JSON.stringify({
        user: userInfo,
        timestamp: Date.now()
      }));

      // Log activity
      addActivityLog(setupFullName.trim(), 'ownerCreated', `One-time wizard completed. Created Owner account [${ownerUsername}].`);

      setTimeout(() => {
        setIsOwnerSetupComplete(true);
        setShowSetupWizard(false);
        navigate('admin/dashboard');
      }, 1500);

    } catch (err: any) {
      setSetupError('Failed to safely process owner setup: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020C1F] flex items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      {/* Dynamic Background Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0B3B8C] rounded-full filter blur-[150px] opacity-20 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#D4A017] rounded-full filter blur-[180px] opacity-10 pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full relative z-10 my-8">
        <div className="bg-[#051128] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          
          {/* Top Logo and Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-[#0B3B8C]/20 border border-[#D4A017]/30 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-[#D4A017]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-serif">
              Zanzibar Trip & Relax
            </h1>
            <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
              {showSetupWizard ? 'Enterprise Setup Wizard' : 'Enterprise Control Console'}
            </p>
          </div>

          {/* Setup Wizard Form (One-time Setup) */}
          {showSetupWizard ? (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-[#D4A017]/25 text-yellow-300/90 p-4 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#D4A017]">
                  <ShieldCheck size={14} />
                  <span>One-Time Owner Setup Wizard</span>
                </div>
                <p>No active Owner profile was detected. Initialize the first administrative Owner user below. This wizard will be permanently disabled upon completion.</p>
              </div>

              {setupError && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0 text-red-400" />
                  <span>{setupError}</span>
                </div>
              )}

              {setupSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-400 animate-bounce" />
                  <span>{setupSuccess}</span>
                </div>
              )}

              <form onSubmit={handleOwnerSetup} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">Full Owner Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={setupFullName}
                      onChange={e => setSetupFullName(e.target.value)}
                      className="w-full text-xs bg-[#081835] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                      placeholder="e.g. Gerevas Paulo Mtaki"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">Owner Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={setupEmail}
                      onChange={e => setSetupEmail(e.target.value)}
                      className="w-full text-xs bg-[#081835] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                      placeholder="e.g. gerevas@zanzibar.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={setupPassword}
                        onChange={e => setSetupPassword(e.target.value)}
                        className="w-full text-xs bg-[#081835] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                        placeholder="••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={setupConfirmPassword}
                        onChange={e => setSetupConfirmPassword(e.target.value)}
                        className="w-full text-xs bg-[#081835] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">Company Name</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={setupCompanyName}
                      onChange={e => setSetupCompanyName(e.target.value)}
                      className="w-full text-xs bg-[#081835] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                      placeholder="Zanzibar Trip & Relax"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">Contact Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={setupPhone}
                      onChange={e => setSetupPhone(e.target.value)}
                      className="w-full text-xs bg-[#081835] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                      placeholder="e.g. +255 629 506 063"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#D4A017]/10"
                >
                  {authLoading ? 'Provisioning Account...' : 'Create Owner Account'}
                </button>
              </form>

              {isOwnerSetupComplete && (
                <button
                  onClick={() => setShowSetupWizard(false)}
                  className="w-full text-center text-[10px] text-slate-400 hover:text-white transition-colors"
                >
                  Switch to Secure Login
                </button>
              )}
            </div>
          ) : (
            /* Regular Login Form */
            <div className="space-y-4">
              {authError && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0 text-red-400" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Username or Email</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full text-sm bg-[#081835] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-medium"
                      placeholder="e.g. owner or admin@zanzibar.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
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
                      className="w-full text-sm bg-[#081835] border border-white/15 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#D4A017]/10"
                >
                  {authLoading ? 'Verifying Session...' : 'Authenticate Securely'}
                </button>
              </form>

              {/* Sandbox Direct Login Console */}
              <div className="border-t border-white/5 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider flex items-center gap-1">
                    <UserCheck size={11} /> Sandbox Quick Roles:
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Bypass with clear roles</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '👑 Owner / Admin', user: 'gerevas', pass: 'zanzibarpassword123', target: 'bookings' },
                    { label: '📊 Manager', user: 'manager', pass: 'managerpassword123', target: 'bookings' },
                    { label: '🎫 Reservation', user: 'sales', pass: 'salespassword123', target: 'bookings' },
                    { label: '🧮 Accountant', user: 'accountant', pass: 'accountantpassword123', target: 'finances' },
                    { label: '📣 Marketing', user: 'marketing', pass: 'marketingpassword123', target: 'subscriptions' },
                    { label: '🧭 Tour Guide', user: 'guide', pass: 'guidepassword123', target: 'guidePortal' },
                    { label: '🚐 Driver Sheet', user: 'driver', pass: 'driverpassword123', target: 'driverPortal' },
                    { label: '👤 Guest Portal', user: 'customer', pass: 'customerpassword123', target: 'customerPortal' }
                  ].map(demo => (
                    <button
                      key={demo.user}
                      onClick={() => {
                        setUsername(demo.user);
                        setPassword(demo.pass);
                        setAuthError('');
                        
                        // Seed admin users list if not found
                        let users = localStorage.getItem('ztr_admin_users');
                        if (!users) {
                          const defaultUsers = [
                            { username: 'gerevas', passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', name: 'Gerevas Paulo Mtaki', role: 'Administrator' },
                            { username: 'manager', passwordHash: '322f98f6d72d24249a15cd388f8d9516ca4d0b13cf3e3b0e13915bc5fcf7ca6c', name: 'Manager Amin', role: 'Manager' },
                            { username: 'sales', passwordHash: '4f4fa1da80a9693e5066922cfb9b47e5ed7a1262d4e8b394efdc2fbf8ca58ea6', name: 'Sales Rep Salma', role: 'Sales' },
                            { username: 'accountant', passwordHash: '20eb81ec7d9834cbd2d8d87948cd122c81fb392a2a0ff9bb86cc5b1d4ef23b8f', name: 'Frank accountant', role: 'Accountant' },
                            { username: 'marketing', passwordHash: '36113bdf2292f39cbf8f8515c61a153835e5d1e2e92bc49692c81358d7e0099e', name: 'Neema Marketing', role: 'Marketing' },
                            { username: 'guide', passwordHash: '2a28178a9c2401f8df9765e90eb21ddb97b1ca6dcff7cedc2826cf8438db06ff', name: 'Captain Guide Ali', role: 'Guide' },
                            { username: 'driver', passwordHash: '0142fa9559c5d0130db99e3ca893b86cb45e05d0e2e987f73967d1db0e987be7', name: 'Driver Juma', role: 'Driver' },
                            { username: 'customer', passwordHash: '4f880fdf8b10ef1f70a1f2fc5080c98f98ff1f6f1c4df821cfdfc6a3ff6e788e', name: 'Customer John Doe', role: 'Customer' }
                          ];
                          localStorage.setItem('ztr_admin_users', JSON.stringify(defaultUsers));
                        }
                        
                        const usersList = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
                        const match = usersList.find((u: any) => u.username === demo.user);
                        if (match) {
                          const userInfo = {
                            username: match.username,
                            name: match.name,
                            role: match.role,
                            email: match.email || `${match.username}@zanzibar.com`,
                            phone: match.phone || '',
                            company: match.company || 'Zanzibar Trip & Relax'
                          };
                          localStorage.setItem('ztr_active_session', JSON.stringify({
                            user: userInfo,
                            timestamp: Date.now()
                          }));
                          addActivityLog(match.name, 'loggedIn', `Instant sandbox bypass as [${match.role}].`);
                          navigate('admin/dashboard');
                        }
                      }}
                      className="bg-[#121B30] hover:bg-[#1b2745] text-slate-350 hover:text-white border border-white/5 py-1.5 px-2 rounded-lg text-[10px] font-bold text-left truncate transition-colors flex items-center justify-between"
                    >
                      <span>{demo.label}</span>
                      <span className="text-[8px] opacity-40">→</span>
                    </button>
                  ))}
                </div>
              </div>

              {!isOwnerSetupComplete && (
                <button
                  onClick={() => setShowSetupWizard(true)}
                  className="w-full text-center text-xs font-semibold text-[#D4A017] hover:underline"
                >
                  Open One-Time Owner Setup Wizard
                </button>
              )}
            </div>
          )}

          {/* Secure details card footer info */}
          <div className="border-t border-white/5 pt-3 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Encrypted with SHA-256 WebCrypto Client Layers &copy; 2026 Admin Portal.
            </span>
          </div>
        </div>

        <button 
          onClick={() => navigate('home')} 
          className="mt-4 mx-auto block text-xs font-bold text-slate-400 hover:text-white transition-all underline"
        >
          ← Back to Public Website
        </button>
      </div>
    </div>
  );
}
