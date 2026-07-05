import { useState, useEffect } from 'react';

interface PlaceholderColors {
  bg: string;
  accent1: string;
  accent2: string;
}

/**
 * Generates a consistent, luxury brand-aligned color palette based on a hash of the image URL.
 */
function getPlaceholderColors(src: string): PlaceholderColors {
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = src.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Premium, high-contrast, Zanzibar-themed color palettes: deep sea blues, sand, sunrise gold, safari green, coral
  const palettes: PlaceholderColors[] = [
    { bg: '#061B3A', accent1: '#0B3B8C', accent2: '#D4A017' }, // Classic deep-sea blue & sand gold
    { bg: '#05232A', accent1: '#0E5C68', accent2: '#D4A017' }, // Tropical lagoon turquoise & gold
    { bg: '#1E1402', accent1: '#4A3205', accent2: '#D4A017' }, // African Serengeti twilight & sunrise gold
    { bg: '#0E1F12', accent1: '#1B4726', accent2: '#10B981' }, // Spice island lush green & mint
    { bg: '#1B0E1D', accent1: '#48154E', accent2: '#F43F5E' }, // Coral sunset pink & rich purple
  ];

  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

/**
 * Custom hook to generate a low-resolution base64 placeholder for any image.
 * 1. Instantly returns a beautiful, color-matched soft-blurred SVG as a base64 data URI.
 * 2. Asynchronously attempts to load the image and downscale it via Canvas to produce a real,
 *    blurred base64 JPEG representation.
 */
export function useLowResPlaceholder(src: string): string {
  const [placeholder, setPlaceholder] = useState<string>('');

  useEffect(() => {
    if (!src) {
      setPlaceholder('');
      return;
    }

    // A. Generate an instant, beautiful, soft-blurred SVG fallback
    const colors = getPlaceholderColors(src);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <filter id="b">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <rect width="100" height="100" fill="${colors.bg}"/>
        <circle cx="20" cy="30" r="45" fill="${colors.accent1}" filter="url(#b)" opacity="0.6"/>
        <circle cx="80" cy="70" r="45" fill="${colors.accent2}" filter="url(#b)" opacity="0.5"/>
      </svg>
    `;
    
    // Safety check for btoa in environments or node testing, standard in browser
    let svgBase64 = '';
    try {
      svgBase64 = `data:image/svg+xml;base64,${btoa(svg.trim())}`;
      setPlaceholder(svgBase64);
    } catch (e) {
      // In case of parsing issues, use a plain colored background fallback
      svgBase64 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${colors.bg}"/></svg>`;
      setPlaceholder(svgBase64);
    }

    // B. Asynchronously load the image and scale it down to a 16x16 canvas to generate a real JPEG base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS-friendly downsizings for CDN images
    img.src = src;

    let isMounted = true;

    img.onload = () => {
      if (!isMounted) return;
      try {
        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);
        const lowResDataUrl = canvas.toDataURL('image/jpeg', 0.25);
        if (lowResDataUrl && lowResDataUrl.startsWith('data:image')) {
          setPlaceholder(lowResDataUrl);
        }
      } catch (err) {
        // Safe to ignore CORS or canvas-tainted errors, we keep our beautiful SVG placeholder
      }
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  return placeholder;
}
