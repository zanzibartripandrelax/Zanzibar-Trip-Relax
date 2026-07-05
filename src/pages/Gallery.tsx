import React, { useEffect, useState, useRef } from 'react';
import { Image, ZoomIn, Upload, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Page } from '../hooks/useHashRouter';
import { ProgressiveImage } from '../components/ProgressiveImage';

interface GalleryProps {
  navigate: (page: Page) => void;
}

const defaultPhotos = [
  { src: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Zanzibar white sand beach', category: 'Beaches', span: 'col-span-2' },
  { src: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Tropical island paradise', category: 'Islands', span: '' },
  { src: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Zanzibar sunset dhow', category: 'Ocean', span: '' },
  { src: 'https://images.pexels.com/photos/4058314/pexels-photo-4058314.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Snorkeling in coral reef', category: 'Ocean', span: '' },
  { src: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Nakupenda sandbank', category: 'Beaches', span: 'col-span-2' },
  { src: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Zanzibar spice farm', category: 'Culture', span: '' },
  { src: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Stone Town architecture', category: 'Culture', span: '' },
  { src: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Safari Blue boat tour', category: 'Ocean', span: '' },
];

const categories = ['All', 'Beaches', 'Ocean', 'Culture', 'Islands', 'Nature', 'Safari', 'Hotels', 'Guest Photos'];

export default function Gallery({ navigate }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);

  // Form states for uploading
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState('Beaches');
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('gallery_photos').select('*').order('uploaded_at', { ascending: false })
      .then(({ data }) => {
        if (data) setUploadedPhotos(data);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10 MB.');
      return;
    }

    setSelectedFile(file);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => setPreviewUrl(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStatus('uploading');
    setErrorMsg('');

    try {
      const ext = selectedFile.name.split('.').pop() || 'jpg';
      const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Upload to Storage
      const { error: storageError } = await supabase.storage.from('gallery').upload(storagePath, selectedFile);
      if (storageError) throw storageError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(storagePath);
      const publicUrl = publicUrlData.publicUrl;

      // Add to DB
      const { data: dbData, error: dbError } = await supabase.from('gallery_photos').insert({
        storage_path: storagePath,
        url: publicUrl,
        alt_text: caption || selectedFile.name,
        category: uploadCategory,
      }).select().single();

      if (dbError) throw dbError;

      setStatus('success');
      setUploadedPhotos(prev => [dbData, ...prev]);
      setTimeout(() => {
        setShowUploadModal(false);
        resetUploadState();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred during upload.');
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setUploadCategory('Beaches');
    setStatus('idle');
    setErrorMsg('');
  };

  const combinedPhotos = [
    ...uploadedPhotos.map(p => ({ src: p.url, alt: p.alt_text || 'Zanzibar Trip and Relax', category: p.category, span: '' })),
    ...defaultPhotos.map(p => ({ ...p, fromDB: false })),
  ];

  const filteredPhotos = selectedCategory === 'All'
    ? combinedPhotos
    : combinedPhotos.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-[#0B1E1B]">
        <div className="absolute inset-0">
          <ProgressiveImage src="https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Gallery" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <p className="font-semibold text-sm uppercase tracking-widest mb-3 text-[#D4A017]">Visual Journey</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
            Gallery
          </h1>
          <div className="w-16 h-1 mx-auto mb-6 bg-[#D4A017]" />
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-6">
            A window into the breathtaking beauty of Zanzibar — beaches, culture, ocean, and nature captured through our adventures.
          </p>
          <button type="button" onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#c49010] text-white px-6 py-3 rounded-full text-sm font-semibold transition-all">
            <Image size={16} /> Upload Your Photo
          </button>
        </div>
      </section>

      {/* Sticky Categories */}
      <section className="bg-white sticky top-20 z-30 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-[#0B3B8C] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            {filteredPhotos.map((photo, index) => (
              <div
                key={index}
                onClick={() => setLightbox({ src: photo.src, alt: photo.alt })}
                className={`${photo.span || ''} relative group cursor-pointer overflow-hidden rounded-xl bg-gray-200`}
              >
                <ProgressiveImage src={photo.src} alt={photo.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center z-10">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100 duration-300" size={24} />
                </div>
                <span className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.category}
                </span>
              </div>
            ))}
            <div onClick={() => setShowUploadModal(true)} className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0B3B8C] transition-colors flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#0B3B8C] min-h-[250px]">
              <Upload size={28} />
              <span className="text-xs font-semibold">Upload Photo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Upload Photo</h3>
                <p className="text-gray-400 text-xs mt-0.5">Share your travel moments with others</p>
              </div>
              <button type="button" onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#0B3B8C] hover:bg-gray-50 transition-all">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Upload size={36} />
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Click to select photo</p>
                      <p className="text-xs">JPEG, PNG, WebP — max 10MB</p>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0B3B8C]">
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption / Heading</label>
                <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g., Feeding the giant tortoises" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0B3B8C]" />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-sm">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              {status === 'success' && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-3 text-sm">
                  <AlertCircle size={16} className="text-green-600" /> Uploaded successfully!
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              <button type="button" onClick={handleUpload} disabled={!selectedFile || status === 'uploading' || status === 'success'} className="w-full bg-[#0B3B8C] hover:bg-[#0a3280] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
                {status === 'uploading' ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button type="button" onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 p-2 rounded-full">
            <X size={24} />
          </button>
          <img src={lightbox.src} alt={lightbox.alt} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium text-center px-4">{lightbox.alt}</p>
        </div>
      )}
    </div>
  );
}
