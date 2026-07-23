import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Search, Filter, Trash2, Edit, X, Crop, Move, Sliders, Check, Copy, CheckSquare } from 'lucide-react';
import { optimizeUploadedImage, OptimizedImagePackage } from '../lib/imageOptimizer';
import { MediaFile, getMediaLibrary, saveMediaLibrary, addActivityLog } from '../lib/cmsStore';
import { uploadToSupabaseStorage } from '../lib/supabase';

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  isCMSReadOnly?: boolean;
}

/**
 * MediaSelector Component: Upgrades simple image inputs to supports file upload,
 * drag-and-drop, choosing from media library, preview, focal-point cropping, and replacing.
 */
export function MediaSelector({
  value,
  onChange,
  onRemove,
  folder = 'tours',
  label = 'Image',
  isCMSReadOnly = false
}: MediaSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isCMSReadOnly) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isCMSReadOnly) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processSelectedFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processSelectedFile(file);
    }
  };

  // Process and optimize uploaded image or document
  const processSelectedFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please select a smaller file.');
      return;
    }

    try {
      let finalUrl = await uploadToSupabaseStorage(file, folder);

      if (!finalUrl) {
        if (file.type.startsWith('image/')) {
          const optimizedPkg = await optimizeUploadedImage(file);
          finalUrl = optimizedPkg.desktop;
        } else {
          // For non-images (PDFs, docs), convert to base64 data URL
          finalUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
      }

      // Save to media library
      const newMediaFile: MediaFile = {
        id: 'media-' + Date.now(),
        name: file.name,
        folder: folder,
        url: finalUrl,
        size: (file.size / 1024).toFixed(0) + ' KB',
        dimensions: file.type.startsWith('image/') ? '1200xH (Optimized)' : 'Document'
      };

      const currentLibrary = getMediaLibrary();
      const updatedLibrary = [newMediaFile, ...currentLibrary];
      saveMediaLibrary(updatedLibrary);
      
      // Notify parent & update
      onChange(finalUrl);
      addActivityLog('Admin / Staff', 'Media Management', `Uploaded media asset "${file.name}" to folder "${folder}"`);
    } catch (err) {
      console.error('Media upload failed:', err);
      alert('Failed to process and upload media file. Please try another file.');
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</label>}
      
      {value ? (
        // Preview State
        <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 aspect-[16/10] flex flex-col justify-between">
          <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#020c1f]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 z-10">
            <div className="flex justify-end gap-1.5">
              {!isCMSReadOnly && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEditor(true)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Crop, Resize & Align Image"
                  >
                    <Edit size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLibrary(true)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Choose from Media Library"
                  >
                    <ImageIcon size={12} />
                    <span>Replace</span>
                  </button>
                </>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-black/50 text-slate-300 px-2 py-1 rounded-lg truncate max-w-[150px]" title={value}>
                {value.startsWith('data:') ? 'Optimized Local Image' : 'Remote URL Asset'}
              </span>
              
              {!isCMSReadOnly && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    if (onRemove) onRemove();
                  }}
                  className="bg-red-950/80 hover:bg-red-900 border border-red-500/30 text-red-400 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
          
          {/* Static View indicators when not hovered */}
          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg text-white pointer-events-none group-hover:opacity-0 transition-opacity">
            <ImageIcon size={12} />
          </div>
        </div>
      ) : (
        // Empty Upload State (Drag and Drop / Select)
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isCMSReadOnly && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[140px] ${
            isDragging
              ? 'border-[#D4A017] bg-[#D4A017]/5'
              : 'border-white/10 hover:border-[#D4A017]/40 hover:bg-[#121B30]/30'
          }`}
        >
          <div className="p-3 bg-slate-800/40 rounded-full text-slate-400 group-hover:text-[#D4A017]">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Drag & drop image here or <span className="text-[#D4A017] hover:underline">browse</span></p>
            <p className="text-[10px] text-slate-400 mt-1">JPEG, JPG, PNG, WebP • Optimized Automatically</p>
          </div>
          
          {!isCMSReadOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLibrary(true);
              }}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-[#D4A017] px-3 py-1.5 rounded-xl font-bold transition-all mt-1"
            >
              Choose from Media Library
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isCMSReadOnly}
          />
        </div>
      )}

      {/* Media Library Selection Modal */}
      {showLibrary && (
        <MediaLibraryModal
          folder={folder}
          onSelect={(url) => {
            onChange(url);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {/* Focal Point / Crop Editor Modal */}
      {showEditor && value && (
        <ImageEditorModal
          imageUrl={value}
          onSave={(editedUrl) => {
            onChange(editedUrl);
            setShowEditor(false);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

interface MediaLibraryModalProps {
  folder?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

/**
 * MediaLibraryModal: Renders a beautiful overlay for choosing, searching, and filtering existing images.
 */
export function MediaLibraryModal({ folder = 'all', onSelect, onClose }: MediaLibraryModalProps) {
  const [library, setLibrary] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    setLibrary(getMediaLibrary());
  }, []);

  const foldersList = ['all', 'banners', 'tours', 'avatars', 'safaris'];

  const filteredItems = library.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const optimizedPkg = await optimizeUploadedImage(file);
        const url = optimizedPkg.desktop;

        const newMediaFile: MediaFile = {
          id: optimizedPkg.id,
          name: optimizedPkg.name,
          folder: selectedFolder === 'all' ? 'tours' : selectedFolder,
          url: url,
          size: optimizedPkg.optimizedSize,
          dimensions: '1200xH (Optimized)'
        };

        const updated = [newMediaFile, ...library];
        setLibrary(updated);
        saveMediaLibrary(updated);
        addActivityLog('Admin / Staff', 'Media Management', `Uploaded and optimized local image "${file.name}"`);
      } catch (err) {
        console.error(err);
        alert('Could not optimize and upload image.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#020C1F]/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A1224] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>CMS Media Library</h3>
            <p className="text-slate-400 text-xs mt-0.5">Select, reuse, and manage images for website items</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-3 items-center justify-between bg-[#081122]">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search assets by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A017]"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={13} />
          </div>

          {/* Folder tabs */}
          <div className="flex overflow-x-auto gap-1 w-full md:w-auto scrollbar-none py-1">
            {foldersList.map((fold) => (
              <button
                key={fold}
                onClick={() => setSelectedFolder(fold)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold capitalize transition-all shrink-0 cursor-pointer ${
                  selectedFolder === fold ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {fold}
              </button>
            ))}
          </div>

          {/* Direct Upload button */}
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => fileInputRef?.click()}
              className="w-full bg-[#0B3B8C] hover:bg-[#082b68] text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Upload size={13} />
              <span>Upload New Image</span>
            </button>
            <input
              ref={(ref) => setFileInputRef(ref)}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadNew}
            />
          </div>
        </div>

        {/* Grid display of media items */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#040A16]">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((media) => (
                <div
                  key={media.id}
                  onClick={() => onSelect(media.url)}
                  className="bg-[#121B30] rounded-2xl overflow-hidden border border-white/5 hover:border-[#D4A017]/40 hover:scale-[1.02] transition-all group relative cursor-pointer flex flex-col justify-between h-48"
                >
                  <div className="relative h-32 w-full bg-slate-950 overflow-hidden">
                    <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[10px] bg-[#D4A017] text-[#020C1F] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                        <Check size={11} /> Use Image
                      </span>
                    </div>
                    <span className="absolute top-2 left-2 bg-black/60 text-slate-300 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                      {media.folder}
                    </span>
                  </div>
                  
                  <div className="p-2 bg-[#0C1527] border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-200 truncate" title={media.name}>
                      {media.name}
                    </p>
                    <p className="text-[8px] text-slate-400 mt-0.5 flex justify-between">
                      <span>{media.size}</span>
                      <span>Reuse</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3">
              <ImageIcon size={36} className="text-slate-600" />
              <div>
                <p className="font-bold text-slate-300">No assets found</p>
                <p className="text-xs mt-1">Try uploading a new image, search a different name, or clear filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ImageEditorModalProps {
  imageUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

/**
 * ImageEditorModal: Powerful client-side crop, scale, focal point, and dimension adjustments
 * rendered directly using an HTML5 canvas! Preserves high-resolution, compresses to WebP.
 */
export function ImageEditorModal({ imageUrl, onSave, onClose }: ImageEditorModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [quality, setQuality] = useState(85);
  const [aspectRatio, setAspectRatio] = useState<number>(1.777); // Default 16:9 banner
  const [previewSize, setPreviewSize] = useState({ width: 1200, height: 675 });
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);

  // Load image object
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // support CORS if loaded from Pexels
    img.src = imageUrl;
    img.onload = () => {
      setImgObj(img);
    };
  }, [imageUrl]);

  // Handle aspect ratio preset changes
  const handleRatioChange = (ratio: number) => {
    setAspectRatio(ratio);
    if (ratio === 1.777) setPreviewSize({ width: 1200, height: 675 }); // 16:9 Banner
    else if (ratio === 1.333) setPreviewSize({ width: 800, height: 600 }); // 4:3 Card
    else if (ratio === 1) setPreviewSize({ width: 600, height: 600 }); // 1:1 Square
    else if (ratio === 1.5) setPreviewSize({ width: 900, height: 600 }); // 3:2 Photo
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleApply = () => {
    if (!imgObj) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not fetch canvas 2D context');

        const outW = previewSize.width;
        const outH = previewSize.height;
        canvas.width = outW;
        canvas.height = outH;

        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, outW, outH);

        // Apply visual zoom and alignment translation
        ctx.translate(outW / 2, outH / 2);
        ctx.translate(offsetX, offsetY);
        ctx.scale(zoom, zoom);

        // Calculate aspect ratios for drawing
        const scaleToFit = Math.max(outW / imgObj.width, outH / imgObj.height);
        const drawW = imgObj.width * scaleToFit;
        const drawH = imgObj.height * scaleToFit;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imgObj, -drawW / 2, -drawH / 2, drawW, drawH);

        // Retrieve optimized output base64
        const format = 'image/webp';
        const finalQuality = quality / 100;
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL(format, finalQuality);
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', finalQuality);
        }

        setIsProcessing(false);
        onSave(dataUrl);
        addActivityLog('Admin / Staff', 'Image Editing', 'Cropped & Optimized image settings');
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
        alert('Could not process image crop. Please try again.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-[#020C1F]/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A1224] border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Editor Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Crop className="text-[#D4A017]" size={18} />
            <h3 className="font-bold text-white text-md" style={{ fontFamily: 'Playfair Display, serif' }}>Advanced Image Editor</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Content Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
          
          {/* Visual Workspace Container */}
          <div className="p-6 bg-[#040A16] flex flex-col items-center justify-center border-r border-white/5 min-h-[300px]">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3">Live Alignment Canvas</span>
            
            {imgObj ? (
              <div 
                className="relative overflow-hidden border border-white/10 rounded-xl bg-black max-w-full flex items-center justify-center"
                style={{
                  width: '100%',
                  aspectRatio: String(aspectRatio),
                  maxHeight: '260px'
                }}
              >
                {/* Simulated preview showing actual cropping mask */}
                <div 
                  className="w-full h-full relative transition-all duration-75"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${zoom * 100}%`,
                    backgroundPosition: `calc(50% + ${offsetX}px) calc(50% + ${offsetY}px)`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
            ) : (
              <div className="animate-pulse flex flex-col items-center gap-2 py-10 text-slate-400 text-xs">
                <div className="animate-spin h-5 w-5 border-2 border-[#D4A017] border-t-transparent rounded-full" />
                <span>Buffering image...</span>
              </div>
            )}
            
            <p className="text-[9px] text-slate-400 mt-3 text-center leading-relaxed">
              Drag sliders to shift focal point, zoom crop, or change aspect layouts.
            </p>
          </div>

          {/* Adjustments Sidebar Controls */}
          <div className="p-6 space-y-5 bg-[#0A1224] flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] text-[#D4A017] font-bold tracking-widest uppercase flex items-center gap-1.5 pb-2 border-b border-white/5">
                <Sliders size={12} /> Tuning & Layout Presets
              </span>

              {/* Layout ratios */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Cropping Ratio Preset</label>
                <div className="grid grid-cols-4 gap-1">
                  <button 
                    onClick={() => handleRatioChange(1.777)}
                    className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${aspectRatio === 1.777 ? 'bg-[#D4A017] border-[#D4A017] text-[#020C1F]' : 'bg-slate-800 border-white/5 text-slate-300 hover:text-white'}`}
                  >
                    16:9 Banner
                  </button>
                  <button 
                    onClick={() => handleRatioChange(1.333)}
                    className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${aspectRatio === 1.333 ? 'bg-[#D4A017] border-[#D4A017] text-[#020C1F]' : 'bg-slate-800 border-white/5 text-slate-300 hover:text-white'}`}
                  >
                    4:3 Card
                  </button>
                  <button 
                    onClick={() => handleRatioChange(1)}
                    className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${aspectRatio === 1 ? 'bg-[#D4A017] border-[#D4A017] text-[#020C1F]' : 'bg-slate-800 border-white/5 text-slate-300 hover:text-white'}`}
                  >
                    1:1 Square
                  </button>
                  <button 
                    onClick={() => handleRatioChange(1.5)}
                    className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${aspectRatio === 1.5 ? 'bg-[#D4A017] border-[#D4A017] text-[#020C1F]' : 'bg-slate-800 border-white/5 text-slate-300 hover:text-white'}`}
                  >
                    3:2 Photo
                  </button>
                </div>
              </div>

              {/* Scale Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Scale Zoom Crop</span>
                  <span className="text-[#D4A017]">{zoom.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#D4A017]" 
                />
              </div>

              {/* Focal X Offset Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Horizontal Alignment Shift (X)</span>
                  <span className="text-slate-300">{offsetX}px</span>
                </div>
                <input 
                  type="range" 
                  min="-300" 
                  max="300" 
                  step="2"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                  className="w-full accent-slate-400" 
                />
              </div>

              {/* Focal Y Offset Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Vertical Alignment Shift (Y)</span>
                  <span className="text-slate-300">{offsetY}px</span>
                </div>
                <input 
                  type="range" 
                  min="-300" 
                  max="300" 
                  step="2"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="w-full accent-slate-400" 
                />
              </div>

              {/* Quality Tuning */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Output Quality Compress</span>
                  <span className="text-emerald-400">{quality}%</span>
                </div>
                <input 
                  type="range" 
                  min="40" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full accent-emerald-500" 
                />
              </div>
            </div>

            {/* Save Actions */}
            <div className="flex gap-2 font-bold text-xs pt-4 border-t border-white/5">
              <button 
                type="button"
                onClick={onClose} 
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleApply}
                disabled={isProcessing || !imgObj}
                className="flex-1 py-2 bg-[#D4A017] hover:bg-[#b5880f] text-[#020C1F] rounded-xl font-bold transition-all disabled:opacity-40 inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-3.5 w-3.5 border border-[#020C1F] border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare size={13} />
                    <span>Apply & Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/**
 * MediaLibraryTab: Comprehensive WordPress-like dedicated dashboard tab for viewing, searching, 
 * filtering, copying references, and deleting media files.
 */
export function MediaLibraryTab() {
  const [library, setLibrary] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = () => {
    setLibrary(getMediaLibrary());
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const foldersList = ['all', 'banners', 'tours', 'avatars', 'safaris'];

  const filteredItems = library.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const optimizedPkg = await optimizeUploadedImage(file);
        const url = optimizedPkg.desktop;

        const newMediaFile: MediaFile = {
          id: optimizedPkg.id,
          name: optimizedPkg.name,
          folder: selectedFolder === 'all' ? 'banners' : selectedFolder,
          url: url,
          size: optimizedPkg.optimizedSize,
          dimensions: '1200xH (Optimized)'
        };

        const updated = [newMediaFile, ...library];
        setLibrary(updated);
        saveMediaLibrary(updated);
        addActivityLog('Admin', 'Media Management', `Uploaded and optimized local image "${file.name}" to vault.`);
        alert(`Successfully uploaded and optimized "${file.name}" to Media Library!`);
      } catch (err) {
        console.error(err);
        alert('Could not optimize and upload image.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the Media Library? This action cannot be undone.`)) {
      const updated = library.filter((item) => item.id !== id);
      setLibrary(updated);
      saveMediaLibrary(updated);
      addActivityLog('Admin', 'Media Management', `Deleted image "${name}" from library`);
    }
  };

  return (
    <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h3 className="font-bold text-slate-200 text-lg flex items-center gap-2">
            <ImageIcon className="text-[#D4A017]" size={18} />
            <span>WordPress-Style Media Library</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, upload, reuse, and copy optimized images instantly across the entire Zanzibar Trip & Relax system.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
        >
          <Upload size={14} />
          <span>Upload Image File</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUploadNew}
        />
      </div>

      {/* Uploading loading panel */}
      {isUploading && (
        <div className="bg-[#0B3B8C]/10 border border-[#0B3B8C]/20 p-5 rounded-2xl flex items-center justify-center gap-3 text-slate-200 font-bold text-xs animate-pulse">
          <div className="animate-spin h-5 w-5 border-2 border-[#D4A017] border-t-transparent rounded-full" />
          <span>Compressing, converting to WebP, and sizing optimizations in progress...</span>
        </div>
      )}

      {/* Search & filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#121B30]/40 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search images by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#081835] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A017]"
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={13} />
        </div>

        <div className="flex overflow-x-auto gap-1.5 w-full md:w-auto scrollbar-none py-1">
          {foldersList.map((fol) => (
            <button
              key={fol}
              onClick={() => setSelectedFolder(fol)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                selectedFolder === fol ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 hover:text-slate-200'
              }`}
            >
              Folder: {fol}
            </button>
          ))}
        </div>
      </div>

      {/* Media showcase grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filteredItems.map((media) => (
            <div key={media.id} className="bg-[#121B30] rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 hover:scale-[1.01] transition-all group relative flex flex-col justify-between h-56 shadow-md">
              <div className="relative h-36 bg-slate-950 overflow-hidden">
                <img src={media.url} alt={media.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[#020c1f]/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(media.url);
                      alert('Direct image reference copied! You can reuse this image anywhere in the CMS dashboard.');
                    }}
                    className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] px-3 py-1.5 rounded-xl text-[10px] font-extrabold shadow-md flex items-center gap-1 transition-all"
                  >
                    <Copy size={11} /> Copy Reference
                  </button>
                  <button
                    onClick={() => handleDelete(media.id, media.name)}
                    className="bg-red-950/80 hover:bg-red-900 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                  >
                    Delete Asset
                  </button>
                </div>
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[#D4A017] text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-lg border border-white/5">
                  {media.folder}
                </span>
              </div>

              <div className="p-3 bg-[#0C1527] border-t border-white/5 space-y-1">
                <div className="font-bold text-slate-200 text-xs truncate" title={media.name}>{media.name}</div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Size: {media.size}</span>
                  <span className="text-[9px] text-[#D4A017] font-medium uppercase tracking-wider">Referenceable</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3">
          <ImageIcon size={44} className="text-slate-600 animate-pulse" />
          <div>
            <p className="font-bold text-slate-200">No media assets match your query</p>
            <p className="text-xs text-slate-400 mt-1">Upload files to populate, search another name, or reset the folders above.</p>
          </div>
        </div>
      )}
    </div>
  );
}
