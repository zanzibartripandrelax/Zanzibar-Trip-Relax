import React, { useState, useRef } from 'react';
import { Upload, Trash2, ArrowLeft, ArrowRight, Eye, RefreshCw, Plus, Check, Image as ImageIcon, Sparkles, Sliders } from 'lucide-react';
import { MediaSelector } from '../MediaManager';
import { uploadToSupabaseStorage } from '../../lib/supabase';
import { optimizeUploadedImage } from '../../lib/imageOptimizer';
import { MediaFile, getMediaLibrary, saveMediaLibrary, addActivityLog } from '../../lib/cmsStore';

interface GalleryManagerProps {
  images: string[];
  onChange: (updatedImages: string[]) => void;
  title?: string;
  folder?: string;
  maxImages?: number;
  session?: any;
  isCMSReadOnly?: boolean;
}

export function GalleryManager({
  images = [],
  onChange,
  title = 'Image Gallery',
  folder = 'gallery',
  maxImages = 30,
  session,
  isCMSReadOnly
}: GalleryManagerProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMultipleFiles = async (fileList: FileList) => {
    if (isCMSReadOnly) return;
    setIsUploading(true);

    const newUrls: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 10MB limit and was skipped.`);
        continue;
      }

      try {
        let finalUrl = await uploadToSupabaseStorage(file, folder);
        if (!finalUrl) {
          const optimized = await optimizeUploadedImage(file);
          finalUrl = optimized.desktop;
        }

        newUrls.push(finalUrl);

        // Add to central media library
        const newMediaFile: MediaFile = {
          id: 'gallery-' + Date.now() + '-' + i,
          name: file.name,
          folder: folder,
          url: finalUrl,
          size: (file.size / 1024).toFixed(0) + ' KB',
          dimensions: 'Optimized Image'
        };

        const currentLibrary = getMediaLibrary();
        saveMediaLibrary([newMediaFile, ...currentLibrary]);
      } catch (e) {
        console.error('Error processing gallery image upload:', e);
      }
    }

    if (newUrls.length > 0) {
      const updated = [...images, ...newUrls];
      onChange(updated);
      addActivityLog(session?.name || 'Owner / Admin', 'Gallery Management', `Uploaded ${newUrls.length} new images to ${title}`);
    }

    setIsUploading(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Delete this image from gallery?')) {
      const updated = images.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const handleReplace = (index: number, newUrl: string) => {
    const updated = [...images];
    updated[index] = newUrl;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon size={16} className="text-[#D4A017]" />
            <span>{title} ({images.length} images)</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Upload multiple files at once, drag & drop to add, reorder, replace, or delete. No URL inputs required.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isCMSReadOnly || isUploading}
          className="px-4 py-2 bg-[#D4A017] hover:bg-[#b88a10] text-[#020C1F] text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Upload size={14} />
          <span>{isUploading ? 'Uploading...' : 'Upload Images'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => e.target.files && handleMultipleFiles(e.target.files)}
        />
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#D4A017] bg-[#D4A017]/10'
            : 'border-white/10 hover:border-white/20 bg-[#081835]/50 hover:bg-[#081835]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
          <Upload size={28} className={isDragging ? 'text-[#D4A017]' : 'text-slate-500'} />
          <p className="text-xs font-medium text-slate-300">
            Drag & Drop multiple images here, or <span className="text-[#D4A017] underline">Browse Files</span>
          </p>
          <p className="text-[10px] text-slate-500">
            Supported formats: JPG, JPEG, PNG, WEBP. Maximum size: 10MB per file.
          </p>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
          {images.map((url, idx) => (
            <div key={idx} className="bg-[#0A1224] border border-white/10 rounded-xl p-2 relative group flex flex-col justify-between space-y-2">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-950 border border-white/5">
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  <button
                    onClick={() => setPreviewImage(url)}
                    className="p-1.5 bg-slate-800 text-white rounded-md text-xs cursor-pointer hover:bg-slate-700"
                    title="Preview"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    disabled={isCMSReadOnly}
                    className="p-1.5 bg-red-950/80 text-red-300 rounded-md text-xs cursor-pointer hover:bg-red-900"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Controls for reordering & replacing */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, 'left')}
                      disabled={idx === 0 || isCMSReadOnly}
                      className="p-1 bg-slate-800 text-slate-300 disabled:opacity-30 rounded hover:bg-slate-700 cursor-pointer"
                      title="Move Left"
                    >
                      <ArrowLeft size={10} />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'right')}
                      disabled={idx === images.length - 1 || isCMSReadOnly}
                      className="p-1 bg-slate-800 text-slate-300 disabled:opacity-30 rounded hover:bg-slate-700 cursor-pointer"
                      title="Move Right"
                    >
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>

                <MediaSelector
                  value={url}
                  onChange={(newUrl) => handleReplace(idx, newUrl)}
                  label="Replace"
                  folder={folder}
                  isCMSReadOnly={isCMSReadOnly}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-500 italic">
          No gallery images uploaded yet.
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 p-2 bg-[#0A1224]" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Full Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
