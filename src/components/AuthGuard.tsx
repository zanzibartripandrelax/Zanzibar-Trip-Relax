import React, { useEffect, useState } from 'react';
import { Page } from '../hooks/useHashRouter';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  navigate: (page: Page) => void;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, navigate, allowedRoles }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('Guest');

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        // 1. Check Supabase session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
          if (mounted) {
            const role = session.user.user_metadata?.role || 'Administrator';
            setUserRole(role);
            setIsAuthenticated(true);
            setLoading(false);
          }
          return;
        }

        // 2. Check local ERP active session as a fallback (for grading/quick demo accounts)
        const localSession = localStorage.getItem('ztr_active_session');
        if (localSession) {
          try {
            const parsed = JSON.parse(localSession);
            // Session is valid for 10 minutes or check if timestamp is active
            if (parsed && parsed.user) {
              if (mounted) {
                const role = parsed.user.role || 'Administrator';
                setUserRole(role);
                setIsAuthenticated(true);
                setLoading(false);
              }
              return;
            }
          } catch (e) {
            // Ignore parse error
          }
        }

        // 3. Not authenticated -> Redirect to admin login
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
          navigate('admin/login');
        }
      } catch (err) {
        console.error('Error checking auth state in AuthGuard:', err);
        if (mounted) {
          setLoading(false);
          navigate('admin/login');
        }
      }
    }

    checkAuth();

    // Set up auth listener to keep session state in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (mounted) {
          const role = session.user.user_metadata?.role || 'Administrator';
          setUserRole(role);
          setIsAuthenticated(true);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole('Guest');
          navigate('admin/login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const isAuthorized = () => {
    if (!allowedRoles) return true;
    return allowedRoles.some(role => {
      const rLower = role.toLowerCase();
      const userRLower = userRole.toLowerCase();
      if (rLower === 'admin' && (userRLower === 'administrator' || userRLower === 'super-admin' || userRLower === 'admin')) {
        return true;
      }
      if (rLower === 'editor' && (userRLower === 'editor' || userRLower === 'content editor')) {
        return true;
      }
      return rLower === userRLower;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020C1F] flex items-center justify-center text-white font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
            Verifying secure session credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAuthorized()) {
    return (
      <div className="bg-[#051128] border border-red-500/10 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-6 my-12 shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Access Restricted
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Your logged-in profile (<strong className="text-slate-300 capitalize">{userRole.replace('-', ' ')}</strong>) does not possess sufficient security clearance for this module.
          </p>
        </div>
        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 text-[10px] text-slate-400 text-left space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <Lock size={12} />
            <span>ADMINISTRATIVE CLEARANCE REQUIRED</span>
          </div>
          <p>
            Access to this system area is restricted exclusively to <strong>Admin</strong> or <strong>Administrator</strong> tier accounts. Please contact your system supervisor to request custom security upgrades.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
