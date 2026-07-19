import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLowResPlaceholder } from '../hooks/useLowResPlaceholder';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g. "aspect-[16/9]" or "aspect-square"
  shimmerClassName?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  aspectRatio = '',
  shimmerClassName = '',
  ...props
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lowResSrc, setLowResSrc] = useState<string | null>(null);
  const generatedPlaceholder = useLowResPlaceholder(src);

  // Generate low-res placeholder on the fly for Pexels, Unsplash, or standard CDN images
  useEffect(() => {
    if (!src) return;

    if (src.includes('pexels.com')) {
      // Replace or append width for a super small LQIP (Low Quality Image Placeholder)
      if (src.includes('w=')) {
        setLowResSrc(src.replace(/w=\d+/, 'w=24&blur=2'));
      } else {
        const joiner = src.includes('?') ? '&' : '?';
        setLowResSrc(`${src}${joiner}w=24&blur=2`);
      }
    } else if (src.includes('unsplash.com')) {
      if (src.includes('w=')) {
        setLowResSrc(src.replace(/w=\d+/, 'w=24&blur=2'));
      } else {
        const joiner = src.includes('?') ? '&' : '?';
        setLowResSrc(`${src}${joiner}w=24&blur=2`);
      }
    } else {
      // Use the dynamically generated low-res base64 placeholder from our custom hook!
      setLowResSrc(generatedPlaceholder);
    }
  }, [src, generatedPlaceholder]);

  // Handle cached images that might load instantly
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden bg-slate-900/5 ${aspectRatio} ${className}`}>
      {/* 1. Low-Res Placeholder or Premium Brand Shimmer */}
      <AnimatePresence mode="popLayout">
        {!isLoaded && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 z-10 w-full h-full flex items-center justify-center overflow-hidden"
          >
            {lowResSrc ? (
              <img
                src={lowResSrc}
                alt={alt}
                className="w-full h-full object-cover blur-md scale-110 pointer-events-none select-none filter brightness-95"
                referrerPolicy="no-referrer"
              />
            ) : (
              // Luxury brand-aligned gradient skeleton loader with golden and deep-sea accents
              <div className="absolute inset-0 bg-gradient-to-tr from-[#061B3A] via-[#0B3B8C] to-[#122A55] flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0)_100%)] animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                {/* Minimalist golden brand emblem placeholder */}
                <div className="w-10 h-10 rounded-full border border-[#D4A017]/30 flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-inner animate-pulse">
                  <div className="w-6 h-6 rounded-full border border-[#D4A017]/20 flex items-center justify-center">
                    <span className="text-[9px] font-extrabold tracking-widest text-[#D4A017]/60">ZTR</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Shimmer Overlay for premium visual weight */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer-fast ${shimmerClassName}`} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. High-Res Image with elegant fade transition */}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        className={`w-full h-full object-cover transition-all duration-[650ms] ease-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
        } ${className}`}
        referrerPolicy="no-referrer"
        {...props}
      />
    </div>
  );
}
