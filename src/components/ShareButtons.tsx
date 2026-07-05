import React, { useState } from 'react';
import { Share2, Link, Send, Mail, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  description: string;
  packageId: string;
}

export default function ShareButtons({ title, description, packageId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Generate direct clean link based on location hash
  const getShareUrl = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}#packages?id=${packageId}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const shareUrl = encodeURIComponent(getShareUrl());
  const shareText = encodeURIComponent(`Check out this incredible Zanzibar trip: "${title}" - ${description}`);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        id={`share-btn-${packageId}`}
        onClick={() => setShowMenu(!showMenu)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:text-[#0B3B8C] hover:border-[#0B3B8C] hover:bg-gray-50 transition-all cursor-pointer"
      >
        <Share2 size={13} />
        <span>Share</span>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-50 text-left animate-in fade-in slide-in-from-top-3 duration-150">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 px-4 pb-1.5 mb-1.5 border-b border-gray-100 tracking-wider">
              Share This Package
            </h4>
            
            <a
              href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs text-gray-600 hover:text-[#25D366] hover:bg-gray-50 flex items-center gap-2 font-medium"
              onClick={() => setShowMenu(false)}
            >
              <Send size={14} className="text-[#25D366]" />
              Share on WhatsApp
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs text-gray-600 hover:text-[#1877F2] hover:bg-gray-50 flex items-center gap-2 font-medium"
              onClick={() => setShowMenu(false)}
            >
              <Share2 size={14} className="text-[#1877F2]" />
              Share on Facebook
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs text-gray-600 hover:text-[#1DA1F2] hover:bg-gray-50 flex items-center gap-2 font-medium"
              onClick={() => setShowMenu(false)}
            >
              <span className="text-gray-900 font-bold text-sm w-3.5 text-center leading-none">𝕏</span>
              Share on X (Twitter)
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent(`Check out this trip: ${title}`)}&body=${encodeURIComponent(`Hey! I found this beautiful Zanzibar trip packages and thought you would love it:\n\n${title}\n${description}\n\nLink to view details: `)}${shareUrl}`}
              className="px-4 py-2 text-xs text-gray-600 hover:text-[#D4A017] hover:bg-gray-50 flex items-center gap-2 font-medium"
              onClick={() => setShowMenu(false)}
            >
              <Mail size={14} className="text-[#D4A017]" />
              Email to a Friend
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:text-[#0B3B8C] hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span className="text-green-600 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Link size={14} className="text-gray-400" />
                  Copy Direct Link
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
