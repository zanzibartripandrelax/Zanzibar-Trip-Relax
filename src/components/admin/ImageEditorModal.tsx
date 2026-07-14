import React, { useState, useEffect, useRef } from 'react';
import { X, Crop, Move, RefreshCw, Check, Undo, HelpCircle, Eye, Sliders, Maximize2 } from 'lucide-react';
import { MediaFile } from '../../lib/cmsStore';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaFile;
  onSave: (updatedMedia: MediaFile) => void;
}

type EditTab = 'crop_resize' | 'focal_point';

export function ImageEditorModal({ isOpen, onClose, media, onSave }: ImageEditorModalProps) {
  const [activeTab, setActiveTab] = useState<EditTab>('crop_resize');
  
  // Crop settings
  const [cropAspect, setCropAspect] = useState<string>('free'); // 'free', '1:1', '16:9', '4:3'
  const [cropLeft, setCropLeft] = useState<number>(0);   // % of image width
  const [cropTop, setCropTop] = useState<number>(0);     // % of image height
  const [cropWidth, setCropWidth] = useState<number>(100); // % of image width
  const [cropHeight, setCropHeight] = useState<number>(100); // % of image height

  // Resize settings
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [targetWidth, setTargetWidth] = useState<number>(1200);
  const [targetHeight, setTargetHeight] = useState<number>(800);
  const [originalDimensions, setOriginalDimensions] = useState<{w: number, h: number}>({ w: 1200, h: 800 });

  // Focal point settings
  const [focalX, setFocalX] = useState<number>(media.focalPoint?.x ?? 50); // percentage (0 - 100)
  const [focalY, setFocalY] = useState<number>(media.focalPoint?.y ?? 50); // percentage (0 - 100)

  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const focalImgRef = useRef<HTMLImageElement>(null);

  // Load image dimensions
  useEffect(() => {
    if (!isOpen) return;
    
    setImageLoaded(false);
    setErrorMessage(null);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalDimensions({ w: img.width, h: img.height });
      setTargetWidth(img.width);
      setTargetHeight(img.height);
      setImageLoaded(true);
    };
    img.onerror = () => {
      setErrorMessage('Could not load image elements. This may be due to cross-origin security restrictions on this specific file URL.');
    };
    img.src = media.originalUrl || media.url;

    // Reset crop fields
    setCropLeft(0);
    setCropTop(0);
    setCropWidth(100);
    setCropHeight(100);
    setCropAspect('free');
    
    // Set focal points
    setFocalX(media.focalPoint?.x ?? 50);
    setFocalY(media.focalPoint?.y ?? 50);
  }, [isOpen, media]);

  // Adjust crop sliders based on aspect ratios
  useEffect(() => {
    if (cropAspect === 'free') return;
    
    const [aspectW, aspectH] = cropAspect.split(':').map(Number);
    const imageRatio = originalDimensions.w / originalDimensions.h;
    const targetRatio = aspectW / aspectH;

    if (targetRatio > imageRatio) {
      // Crop height is constrained
      const newHeightPercent = Math.round((imageRatio / targetRatio) * 100);
      setCropHeight(newHeightPercent);
      setCropWidth(100);
      setCropLeft(0);
      setCropTop(Math.round((100 - newHeightPercent) / 2));
    } else {
      // Crop width is constrained
      const newWidthPercent = Math.round((targetRatio / imageRatio) * 100);
      setCropWidth(newWidthPercent);
      setCropHeight(100);
      setCropTop(0);
      setCropLeft(Math.round((100 - newWidthPercent) / 2));
    }
  }, [cropAspect, originalDimensions]);

  // Handle manual width adjustment
  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspect && originalDimensions.w > 0) {
      const cropRatio = cropWidth / cropHeight;
      const originalRatio = originalDimensions.w / originalDimensions.h;
      const activeRatio = cropAspect === 'free' ? originalRatio * (cropWidth / cropHeight) : originalRatio * (cropWidth / cropHeight);
      setTargetHeight(Math.round(w / activeRatio));
    }
  };

  // Handle manual height adjustment
  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspect && originalDimensions.h > 0) {
      const originalRatio = originalDimensions.w / originalDimensions.h;
      const activeRatio = originalRatio * (cropWidth / cropHeight);
      setTargetWidth(Math.round(h * activeRatio));
    }
  };

  // Drag handles for the cropping zone (simplified using sliders for safety & ease)
  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!focalImgRef.current) return;
    const rect = focalImgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    setFocalX(Math.max(0, Math.min(100, Math.round(x))));
    setFocalY(Math.max(0, Math.min(100, Math.round(y))));
  };

  // Execute crop & resize logic on Canvas
  const handleApplyEdits = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const srcUrl = media.originalUrl || media.url;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create 2D canvas context.');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for canvas operations.'));
        img.src = srcUrl;
      });

      // Calculate source bounding box from percentages
      const sourceX = (cropLeft / 100) * img.width;
      const sourceY = (cropTop / 100) * img.height;
      const sourceW = (cropWidth / 100) * img.width;
      const sourceH = (cropHeight / 100) * img.height;

      // Setup canvas size
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw cropped slice onto canvas, with high scaling filter
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, targetWidth, targetHeight);

      // Convert to webp base64 (or jpeg as backup)
      let finalDataUrl = '';
      try {
        finalDataUrl = canvas.toDataURL('image/webp', 0.9);
      } catch {
        finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }

      // Calculate estimate file size from base64 string length
      const finalSizeKB = Math.round((finalDataUrl.length * 3) / 4 / 1024);

      // Construct final object
      const updatedMedia: MediaFile = {
        ...media,
        url: finalDataUrl,
        size: `${finalSizeKB} KB`,
        dimensions: `${targetWidth}x${targetHeight}`,
        focalPoint: { x: focalX, y: focalY },
        originalUrl: media.originalUrl || media.url // Backup original to allow re-crop or revert
      };

      onSave(updatedMedia);
      onClose();
    } catch (err: any) {
      console.error('Image editor canvas processing error:', err);
      setErrorMessage(err.message || 'An error occurred while cropping and resizing the image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevert = () => {
    if (!media.originalUrl) return;
    
    if (confirm('Are you sure you want to revert all cropped and resized edits? This will restore the high-res original image.')) {
      const reverted: MediaFile = {
        ...media,
        url: media.originalUrl,
        focalPoint: { x: 50, y: 50 },
        size: 'Original Size',
        dimensions: 'Original resolution'
      };
      
      // Let parent save it
      onSave(reverted);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A1224] border border-white/10 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0C1527]">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Sliders size={18} className="text-[#D4A017]" />
              <span>Zanzibar Media Studio - Advanced Image Customizer</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Refit and optimize your media assets for lightning-fast performance and seamless banner framing.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* Main workspace (interactive canvas or focal point selector) */}
          <div className="lg:col-span-8 p-6 bg-slate-950 flex flex-col justify-between overflow-y-auto h-full min-h-[300px]">
            
            {errorMessage && (
              <div className="bg-red-950/40 border border-red-500/15 p-3 rounded-xl mb-4 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            {!imageLoaded && !errorMessage ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <RefreshCw className="animate-spin text-[#D4A017]" size={36} />
                <p className="text-xs font-semibold">Loading full-resolution original file into editor buffer...</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center relative p-4 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                
                {/* 1. CROP & RESIZE Workspace */}
                {activeTab === 'crop_resize' && (
                  <div className="relative max-w-full max-h-[50vh] flex items-center justify-center select-none" ref={containerRef}>
                    <img 
                      ref={imgRef}
                      src={media.originalUrl || media.url} 
                      alt="Crop Source" 
                      className="max-w-full max-h-[45vh] object-contain rounded opacity-40 select-none pointer-events-none" 
                    />
                    
                    {/* Cropping box overlay */}
                    <div 
                      className="absolute border-2 border-[#D4A017] shadow-[0_0_15px_rgba(212,160,23,_0.3)] bg-transparent overflow-hidden"
                      style={{
                        left: `${cropLeft}%`,
                        top: `${cropTop}%`,
                        width: `${cropWidth}%`,
                        height: `${cropHeight}%`,
                        transition: 'all 0.2s ease-out'
                      }}
                    >
                      {/* Grid guidelines inside the crop area */}
                      <div className="w-full h-full border-t border-b border-dashed border-white/25 flex flex-col justify-between">
                        <div className="h-px border-b border-dashed border-white/25 w-full"></div>
                        <div className="h-px border-t border-dashed border-white/25 w-full"></div>
                      </div>
                      <div className="absolute inset-0 flex justify-between">
                        <div className="w-px border-r border-dashed border-white/25 h-full"></div>
                        <div className="w-px border-l border-dashed border-white/25 h-full"></div>
                      </div>
                      
                      {/* High resolution inner image view to create cropped spotlight */}
                      <img 
                        src={media.originalUrl || media.url} 
                        alt="Crop Spotlight" 
                        className="absolute object-cover max-w-none pointer-events-none"
                        style={{
                          width: `${10000 / cropWidth}%`,
                          height: `${10000 / cropHeight}%`,
                          left: `${-cropLeft * (100 / cropWidth)}%`,
                          top: `${-cropTop * (100 / cropHeight)}%`,
                          transition: 'all 0.2s ease-out'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. FOCAL POINT Workspace */}
                {activeTab === 'focal_point' && (
                  <div className="relative max-w-full max-h-[50vh] flex items-center justify-center select-none">
                    <div 
                      className="relative cursor-crosshair overflow-hidden rounded group"
                      onClick={handleFocalPointClick}
                    >
                      <img 
                        ref={focalImgRef}
                        src={media.originalUrl || media.url} 
                        alt="Focal point Source" 
                        className="max-w-full max-h-[45vh] object-contain" 
                      />
                      
                      {/* Crosshair pulse */}
                      <div 
                        className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-[#D4A017] bg-[#D4A017]/20 flex items-center justify-center animate-pulse pointer-events-none shadow-[0_0_10px_#D4A017]"
                        style={{
                          left: `${focalX}%`,
                          top: `${focalY}%`,
                        }}
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>

                      {/* Tooltip guide */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] text-slate-300 backdrop-blur pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                        Click anywhere to anchor the layout focus focal point
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Quick guide text */}
            <div className="mt-4 flex gap-2 items-start bg-[#121B30]/30 border border-white/5 p-3 rounded-2xl text-[10px] text-slate-400">
              <HelpCircle size={14} className="text-[#D4A017] shrink-0 mt-0.5" />
              {activeTab === 'crop_resize' ? (
                <span>
                  <strong>Crop controls</strong>: Use the sidebar sliders to trim unnecessary margins. Aspect ratio presets automatically constrain sizing to ensure standard web container fitting.
                </span>
              ) : (
                <span>
                  <strong>Focal point</strong>: Tap a key element (like a person's face or majestic lion) to set the focus point. When this image is auto-cropped on narrow mobile screens, that specific coordinate will remain centered.
                </span>
              )}
            </div>

          </div>

          {/* Right settings bar */}
          <div className="lg:col-span-4 p-5 bg-[#0C1527] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-5">
              
              {/* Workspace Tab Buttons */}
              <div className="grid grid-cols-2 gap-1.5 bg-[#121B30] p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('crop_resize')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'crop_resize' 
                      ? 'bg-[#D4A017] text-[#020C1F] shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crop size={14} />
                  <span>Crop & Resize</span>
                </button>
                <button
                  onClick={() => setActiveTab('focal_point')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'focal_point' 
                      ? 'bg-[#D4A017] text-[#020C1F] shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Maximize2 size={14} />
                  <span>Focal Point</span>
                </button>
              </div>

              {/* SECTION A: CROP & RESIZE SLIDERS */}
              {activeTab === 'crop_resize' && (
                <div className="space-y-4">
                  
                  {/* Aspect Ratio Presets */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Aspect Ratio Presets</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'free', label: 'Freeform Crop' },
                        { id: '1:1', label: '1:1 Square Card' },
                        { id: '16:9', label: '16:9 Landscape' },
                        { id: '4:3', label: '4:3 Standard' }
                      ].map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setCropAspect(preset.id)}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            cropAspect === preset.id 
                              ? 'border-[#D4A017] text-[#D4A017] bg-[#D4A017]/5' 
                              : 'border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual cropping coordinate sliders */}
                  <div className="space-y-3 bg-[#121B30]/30 p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-300 font-bold block pb-1 border-b border-white/5">Crop Area Boundaries</span>
                    
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Left Margin</span>
                        <span className="font-mono text-[#D4A017]">{cropLeft}%</span>
                      </div>
                      <input 
                        type="range" min="0" max={100 - cropWidth} value={cropLeft}
                        onChange={(e) => setCropLeft(Number(e.target.value))}
                        disabled={cropAspect !== 'free'}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4A017] disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Top Margin</span>
                        <span className="font-mono text-[#D4A017]">{cropTop}%</span>
                      </div>
                      <input 
                        type="range" min="0" max={100 - cropHeight} value={cropTop}
                        onChange={(e) => setCropTop(Number(e.target.value))}
                        disabled={cropAspect !== 'free'}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4A017] disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Cropped Width</span>
                        <span className="font-mono text-[#D4A017]">{cropWidth}%</span>
                      </div>
                      <input 
                        type="range" min="10" max={100 - cropLeft} value={cropWidth}
                        onChange={(e) => setCropWidth(Number(e.target.value))}
                        disabled={cropAspect !== 'free'}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4A017] disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Cropped Height</span>
                        <span className="font-mono text-[#D4A017]">{cropHeight}%</span>
                      </div>
                      <input 
                        type="range" min="10" max={100 - cropTop} value={cropHeight}
                        onChange={(e) => setCropHeight(Number(e.target.value))}
                        disabled={cropAspect !== 'free'}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4A017] disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Resizing Outputs */}
                  <div className="space-y-3 bg-[#121B30]/30 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-1 border-b border-white/5">
                      <span className="text-[10px] text-slate-300 font-bold block">Target Image Size</span>
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                        <input 
                          type="checkbox" checked={lockAspect} 
                          onChange={(e) => setLockAspect(e.target.checked)} 
                          className="rounded bg-slate-800 border-white/10 text-[#D4A017] focus:ring-0" 
                        />
                        <span>Lock Aspect</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block mb-1">Width (px)</span>
                        <input
                          type="number"
                          value={targetWidth}
                          onChange={(e) => handleWidthChange(Number(e.target.value))}
                          className="w-full bg-[#121B30] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block mb-1">Height (px)</span>
                        <input
                          type="number"
                          value={targetHeight}
                          onChange={(e) => handleHeightChange(Number(e.target.value))}
                          disabled={lockAspect}
                          className="w-full bg-[#121B30] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4A017] disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                      <span>Source resolution:</span>
                      <span className="font-mono text-slate-300">{originalDimensions.w}x{originalDimensions.h}px</span>
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION B: FOCAL POINT PREVIEWS */}
              {activeTab === 'focal_point' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Focal Position Coordinates</span>
                    <div className="grid grid-cols-2 gap-2 bg-[#121B30]/30 p-2.5 rounded-xl border border-white/5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-500">Focus X:</span>
                        <span className="text-[#D4A017]">{focalX}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-500">Focus Y:</span>
                        <span className="text-[#D4A017]">{focalY}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Live crop simulation */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Focal Framing Simulation</span>
                    
                    {/* Landscape simulator */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">1. Wide Banner Card (16:9 Crop)</span>
                      <div className="h-16 w-full rounded-lg overflow-hidden border border-white/10 relative">
                        <img 
                          src={media.originalUrl || media.url} 
                          alt="Banner Simulator" 
                          className="w-full h-full object-cover"
                          style={{ objectPosition: `${focalX}% ${focalY}%` }}
                        />
                      </div>
                    </div>

                    {/* Square simulator */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">2. Square Team / Review Avatar (1:1 Crop)</span>
                      <div className="h-20 w-20 rounded-full overflow-hidden border border-white/10 relative mx-auto">
                        <img 
                          src={media.originalUrl || media.url} 
                          alt="Square Simulator" 
                          className="w-full h-full object-cover"
                          style={{ objectPosition: `${focalX}% ${focalY}%` }}
                        />
                      </div>
                    </div>

                    {/* Portrait simulator */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">3. Tall Mobile Safari Card (3:4 Crop)</span>
                      <div className="h-24 w-28 rounded-lg overflow-hidden border border-white/10 relative mx-auto">
                        <img 
                          src={media.originalUrl || media.url} 
                          alt="Portrait Simulator" 
                          className="w-full h-full object-cover"
                          style={{ objectPosition: `${focalX}% ${focalY}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="pt-6 space-y-2 border-t border-white/5 mt-6">
              
              <button
                onClick={handleApplyEdits}
                disabled={isProcessing || !imageLoaded}
                className="w-full bg-[#D4A017] hover:bg-[#b8860b] disabled:opacity-50 text-[#020C1F] text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Processing & Preserving...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} className="stroke-[3px]" />
                    <span>Confirm & Save Changes</span>
                  </>
                )}
              </button>

              {media.originalUrl && (
                <button
                  onClick={handleRevert}
                  type="button"
                  className="w-full bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2.5 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Undo size={14} />
                  <span>Revert to High-Res Original</span>
                </button>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
