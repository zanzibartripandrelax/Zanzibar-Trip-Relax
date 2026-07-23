import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { SiteLogos, getSiteLogos, saveSiteLogos, DEFAULT_SITE_LOGOS, addActivityLog } from '../../lib/cmsStore';
import { MediaSelector } from '../MediaManager';

interface LogoManagerProps {
  session?: any;
  isCMSReadOnly?: boolean;
}

export function LogoManager({ session, isCMSReadOnly }: LogoManagerProps) {
  const [logos, setLogos] = useState<SiteLogos>(getSiteLogos());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLogos(getSiteLogos());
  }, []);

  const handleLogoChange = (key: keyof SiteLogos, url: string) => {
    setLogos(prev => ({ ...prev, [key]: url }));
    setSavedSuccess(false);
  };

  const handleSaveAll = () => {
    saveSiteLogos(logos);
    setSavedSuccess(true);
    addActivityLog(session?.name || 'Owner / Admin', 'Logo Manager', 'Updated website brand logos across header, footer, mobile, dark/light variations and favicon');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all logos to original defaults?')) {
      setLogos(DEFAULT_SITE_LOGOS);
      saveSiteLogos(DEFAULT_SITE_LOGOS);
      addActivityLog(session?.name || 'Owner / Admin', 'Logo Manager', 'Reset website logos to default branding assets');
    }
  };

  const logoTypes: { key: keyof SiteLogos; title: string; description: string; recommendedSize: string }[] = [
    {
      key: 'headerLogo',
      title: 'Header / Main Navbar Logo',
      description: 'Primary logo displayed in the top navigation bar across all desktop and tablet screens.',
      recommendedSize: '500x500 px or vector PNG/WEBP with transparent background'
    },
    {
      key: 'footerLogo',
      title: 'Footer Logo',
      description: 'Logo displayed at the bottom of all pages in the dark luxury footer section.',
      recommendedSize: '500x500 px or high-contrast PNG with transparent background'
    },
    {
      key: 'mobileLogo',
      title: 'Mobile Drawer Logo',
      description: 'Iconic logo shown inside the mobile navigation menu slide-out drawer.',
      recommendedSize: '250x250 px transparent icon/emblem'
    },
    {
      key: 'darkLogo',
      title: 'Dark Mode / Night Theme Logo',
      description: 'Optimized high-contrast logo used against dark indigo/black backdrops.',
      recommendedSize: '500x500 px white or gold tinted transparent image'
    },
    {
      key: 'lightLogo',
      title: 'Light Mode / Document Logo',
      description: 'Logo used on white PDF invoices, printable booking passes, and email headers.',
      recommendedSize: '500x500 px full color or dark navy transparent image'
    },
    {
      key: 'favicon',
      title: 'Website Favicon / Browser Icon',
      description: 'Small icon displayed in browser tabs and mobile bookmarks.',
      recommendedSize: '64x64 or 128x128 px PNG, ICO, or SVG'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0A1224] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="text-[#D4A017]" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Website Logo Manager</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Upload, preview, and replace website logos. All uploaded assets are stored securely and updated automatically across every header, footer, mobile view, PDF generator, and browser favicon.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              disabled={isCMSReadOnly}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-white/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isCMSReadOnly}
              className="px-5 py-2.5 bg-[#D4A017] hover:bg-[#b88a10] text-[#020C1F] text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-[#D4A017]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>Save & Publish Logos</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 size={16} />
            <span>Website logos published successfully! All pages, navigation bars, and favicons updated.</span>
          </div>
        )}
      </div>

      {/* Grid of 6 Logo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logoTypes.map((item) => {
          const currentUrl = logos[item.key] || DEFAULT_SITE_LOGOS[item.key];

          return (
            <div key={item.key} className="bg-[#0A1224] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#D4A017]" />
                    <span>{item.title}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-white/5">
                    {item.key}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{item.description}</p>

                {/* Preview Box with transparent grid background */}
                <div className="relative w-full h-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950 rounded-xl border border-white/10 flex items-center justify-center p-4 overflow-hidden group">
                  {currentUrl ? (
                    <img
                      src={currentUrl}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                      <ImageIcon size={24} />
                      <span>No Logo Uploaded</span>
                    </div>
                  )}

                  {currentUrl && (
                    <button
                      onClick={() => handleLogoChange(item.key, '')}
                      disabled={isCMSReadOnly}
                      className="absolute top-2 right-2 p-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/30 text-red-300 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Clear Logo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="mt-2 text-[10px] text-slate-500 italic">
                  Recommended: {item.recommendedSize}
                </div>
              </div>

              {/* Media Upload Selector */}
              <div>
                <MediaSelector
                  value={currentUrl}
                  onChange={(url) => handleLogoChange(item.key, url)}
                  label={`Upload or Replace ${item.title}`}
                  folder="logos"
                  isCMSReadOnly={isCMSReadOnly}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
