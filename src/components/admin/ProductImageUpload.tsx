import React, { useState } from 'react';
import { 
  Upload, Trash2, ArrowLeft, ArrowRight, Sparkles, Image as ImageIcon, 
  Map, FileText, CheckCircle2, RefreshCw
} from 'lucide-react';
import { uploadToSupabaseStorage } from '../../lib/supabase';
import { optimizeUploadedImage } from '../../lib/imageOptimizer';

interface ProductImageUploadProps {
  product: any;
  onChange: (updatedProduct: any) => void;
}

export default function ProductImageUpload({ product, onChange }: ProductImageUploadProps) {
  const [dragOverField, setDragOverField] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setDragOverField(field);
  };

  const handleDragLeave = () => {
    setDragOverField(null);
  };

  // Process File and upload to Supabase or optimize
  const processAndUploadFile = async (file: File, field: 'image' | 'heroBanner' | 'mapImage' | 'accommodationImage' | 'gallery') => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds the 10MB maximum limit.`);
      return;
    }

    try {
      let finalUrl = await uploadToSupabaseStorage(file, 'tours');
      if (!finalUrl) {
        const optimized = await optimizeUploadedImage(file);
        finalUrl = optimized.desktop;
      }

      const mediaItem = {
        id: `media-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        url: finalUrl,
        caption: `${file.name.split('.')[0]}`,
        altText: product.title || 'Travel Product Resource',
        optimizationNotes: `Uploaded & Optimized (${(file.size / 1024).toFixed(0)}KB)`
      };

      if (field === 'gallery') {
        const currentGallery = product.gallery || [];
        onChange({
          ...product,
          gallery: [...currentGallery, mediaItem]
        });
      } else {
        onChange({
          ...product,
          [field]: finalUrl,
          [`${field}Optimized`]: mediaItem.optimizationNotes
        });
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'heroBanner' | 'mapImage' | 'accommodationImage' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((f: any) => processAndUploadFile(f, field));
  };

  const handleDrop = (e: React.DragEvent, field: 'image' | 'heroBanner' | 'mapImage' | 'accommodationImage' | 'gallery') => {
    e.preventDefault();
    setDragOverField(null);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((f: any) => processAndUploadFile(f, field));
  };

  // Reorder photo inside gallery
  const reorderGallery = (index: number, direction: 'left' | 'right') => {
    const galleryCopy = [...(product.gallery || [])];
    if (direction === 'left' && index > 0) {
      const temp = galleryCopy[index];
      galleryCopy[index] = galleryCopy[index - 1];
      galleryCopy[index - 1] = temp;
    } else if (direction === 'right' && index < galleryCopy.length - 1) {
      const temp = galleryCopy[index];
      galleryCopy[index] = galleryCopy[index + 1];
      galleryCopy[index + 1] = temp;
    }
    onChange({ ...product, gallery: galleryCopy });
  };

  // Delete gallery photo
  const deleteGalleryPhoto = (id: string) => {
    const galleryCopy = (product.gallery || []).filter((g: any) => g.id !== id);
    onChange({ ...product, gallery: galleryCopy });
  };

  // Update photo caption
  const updateCaption = (id: string, caption: string) => {
    const galleryCopy = (product.gallery || []).map((g: any) => 
      g.id === id ? { ...g, caption } : g
    );
    onChange({ ...product, gallery: galleryCopy });
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="border-b border-white/5 pb-3 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">High Definition Direct Media Upload</h4>
          <p className="text-[10px] text-slate-400">Drag & drop files directly. No external image URLs required. Optimized on submission.</p>
        </div>
        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full font-black uppercase flex items-center gap-1">
          <Sparkles size={11} /> Auto Compression Active (60% Saving)
        </span>
      </div>

      {/* Grid of Key Image Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* FIELD 1: COVER IMAGE */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">1. Catalog Cover Image</label>
          
          <div 
            onDragOver={e => handleDragOver(e, 'image')}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, 'image')}
            className={`relative h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all text-center ${
              dragOverField === 'image' 
                ? 'border-[#D4A017] bg-[#D4A017]/10' 
                : 'border-white/10 bg-[#0F1E36]/20 hover:border-white/25'
            }`}
          >
            {product.image || product.img ? (
              <div className="absolute inset-0 group">
                <img src={product.image || product.img} alt="Cover Preview" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
                  <p className="text-[10px] text-white font-bold">Replace Cover Image</p>
                  <label className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-[9px] font-black px-2.5 py-1.5 rounded cursor-pointer uppercase">
                    Browse File
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="text-[#D4A017] mx-auto" size={24} />
                <p className="text-[10px] text-slate-300 font-bold">Drag cover photo here</p>
                <p className="text-[9px] text-slate-500">Or click to browse</p>
                <label className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-black px-2.5 py-1.5 rounded cursor-pointer uppercase">
                  Browse
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} className="hidden" />
                </label>
              </div>
            )}
          </div>
          {product.imageOptimized && (
            <p className="text-[9px] text-emerald-400 font-mono italic">✓ {product.imageOptimized}</p>
          )}
        </div>

        {/* FIELD 2: HERO BANNER */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">2. Page Hero Banner</label>
          
          <div 
            onDragOver={e => handleDragOver(e, 'heroBanner')}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, 'heroBanner')}
            className={`relative h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all text-center ${
              dragOverField === 'heroBanner' 
                ? 'border-[#D4A017] bg-[#D4A017]/10' 
                : 'border-white/10 bg-[#0F1E36]/20 hover:border-white/25'
            }`}
          >
            {product.heroBanner ? (
              <div className="absolute inset-0 group">
                <img src={product.heroBanner} alt="Hero Banner Preview" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
                  <p className="text-[10px] text-white font-bold">Replace Banner Image</p>
                  <label className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-[9px] font-black px-2.5 py-1.5 rounded cursor-pointer uppercase">
                    Browse File
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'heroBanner')} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="text-[#D4A017] mx-auto" size={24} />
                <p className="text-[10px] text-slate-300 font-bold">Drag wide banner here</p>
                <p className="text-[9px] text-slate-500">Dimensions: 1920x600 recommended</p>
                <label className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-black px-2.5 py-1.5 rounded cursor-pointer uppercase">
                  Browse
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'heroBanner')} className="hidden" />
                </label>
              </div>
            )}
          </div>
          {product.heroBannerOptimized && (
            <p className="text-[9px] text-emerald-400 font-mono italic">✓ {product.heroBannerOptimized}</p>
          )}
        </div>

        {/* FIELD 3: MAP / ROUTE IMAGE */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">3. Route Map Graphic</label>
          
          <div 
            onDragOver={e => handleDragOver(e, 'mapImage')}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, 'mapImage')}
            className={`relative h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all text-center ${
              dragOverField === 'mapImage' 
                ? 'border-[#D4A017] bg-[#D4A017]/10' 
                : 'border-white/10 bg-[#0F1E36]/20 hover:border-white/25'
            }`}
          >
            {product.mapImage ? (
              <div className="absolute inset-0 group">
                <img src={product.mapImage} alt="Map Preview" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
                  <p className="text-[10px] text-white font-bold">Replace Map Image</p>
                  <label className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-[9px] font-black px-2.5 py-1.5 rounded cursor-pointer uppercase">
                    Browse File
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'mapImage')} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Map className="text-[#D4A017] mx-auto" size={24} />
                <p className="text-[10px] text-slate-300 font-bold">Drag route/park map here</p>
                <p className="text-[9px] text-slate-500">Perfect for Safaris & treks</p>
                <label className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-black px-2.5 py-1.5 rounded cursor-pointer uppercase">
                  Browse
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'mapImage')} className="hidden" />
                </label>
              </div>
            )}
          </div>
          {product.mapImageOptimized && (
            <p className="text-[9px] text-emerald-400 font-mono italic">✓ {product.mapImageOptimized}</p>
          )}
        </div>

      </div>

      {/* GALLERY BENTO MODULE */}
      <div className="space-y-4">
        <div className="border-t border-white/5 pt-6 flex justify-between items-center">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Multi-Photo Showcase Gallery</label>
          <label className="bg-[#D4A017]/10 hover:bg-[#D4A017]/25 border border-[#D4A017]/30 text-[#D4A017] text-[10px] font-black py-1.5 px-3 rounded-lg cursor-pointer transition-all uppercase">
            Upload Photos
            <input type="file" accept="image/*" multiple onChange={e => handleFileChange(e, 'gallery')} className="hidden" />
          </label>
        </div>

        <div 
          onDragOver={e => handleDragOver(e, 'gallery')}
          onDragLeave={handleDragLeave}
          onDrop={e => handleDrop(e, 'gallery')}
          className={`min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all text-center ${
            dragOverField === 'gallery' 
              ? 'border-[#D4A017] bg-[#D4A017]/10' 
              : 'border-white/5 bg-[#0A1224]/50'
          }`}
        >
          {(!product.gallery || product.gallery.length === 0) ? (
            <div className="space-y-1">
              <ImageIcon size={30} className="text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-bold">Drag multiple photo files into this window</p>
              <p className="text-[10px] text-slate-500">Files will instantly auto-align into a crop showcase layout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
              {product.gallery.map((photo: any, index: number) => (
                <div key={photo.id} className="bg-[#121B30] border border-white/10 rounded-xl overflow-hidden flex flex-col group relative">
                  
                  {/* Photo Display */}
                  <div className="relative h-28 bg-slate-900">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => reorderGallery(index, 'left')} 
                          disabled={index === 0}
                          className="bg-black/60 hover:bg-black p-1 rounded text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft size={10} />
                        </button>
                        <button 
                          onClick={() => reorderGallery(index, 'right')} 
                          disabled={index === product.gallery.length - 1}
                          className="bg-black/60 hover:bg-black p-1 rounded text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ArrowRight size={10} />
                        </button>
                      </div>
                      <button 
                        onClick={() => deleteGalleryPhoto(photo.id)}
                        className="bg-red-950/80 hover:bg-red-900 p-1 rounded text-red-400"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Caption Editing */}
                  <div className="p-2 space-y-1">
                    <input 
                      type="text" 
                      value={photo.caption || ''} 
                      onChange={e => updateCaption(photo.id, e.target.value)}
                      placeholder="Caption..."
                      className="w-full bg-[#0A1224] border border-white/5 rounded px-2 py-1 text-[10px] text-white focus:border-[#D4A017] outline-none"
                    />
                    <p className="text-[7px] text-slate-500 truncate" title={photo.optimizationNotes}>
                      {photo.optimizationNotes || 'Web optimized'}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
