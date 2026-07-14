import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Search, Filter, Trash2, Edit, X, Copy, Check, Info, FileImage, RefreshCw, FolderOpen, Heart } from 'lucide-react';
import { getMediaLibrary, saveMediaLibrary, addActivityLog, MediaFile } from '../../lib/cmsStore';
import { optimizeUploadedImage } from '../../lib/imageOptimizer';
import { ImageEditorModal } from './ImageEditorModal';

interface MediaLibraryProps {
  onSelectImage?: (url: string) => void;
  allowedFolder?: string;
  className?: string;
}

export function MediaLibrary({ onSelectImage, allowedFolder = 'all', className = '' }: MediaLibraryProps) {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>(allowedFolder);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [hasFileSystemSupport, setHasFileSystemSupport] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Editor states
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Metadata Edit states
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editName, setEditName] = useState('');
  const [editFolder, setEditFolder] = useState('');
  const [editFilePath, setEditFilePath] = useState('');
  const [editAltText, setEditAltText] = useState('');

  // Sync edit states when selectedMedia changes
  useEffect(() => {
    if (selectedMedia) {
      setEditName(selectedMedia.name || '');
      setEditFolder(selectedMedia.folder || 'banners');
      setEditFilePath(selectedMedia.filePath || `${selectedMedia.folder || 'banners'}/${selectedMedia.name}`);
      setEditAltText(selectedMedia.altText || '');
    } else {
      setIsEditingMetadata(false);
    }
  }, [selectedMedia]);

  // Check for modern File System Access API support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      setHasFileSystemSupport(true);
    }
    loadMedia();
  }, []);

  const loadMedia = () => {
    setMediaList(getMediaLibrary());
  };

  // Modern File System Access API upload handler
  const handleFileSystemPicker = async () => {
    if (!hasFileSystemSupport) {
      fileInputRef.current?.click();
      return;
    }

    try {
      setIsProcessing(true);
      const options = {
        types: [
          {
            description: 'Web-ready Image Files',
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg', '.webp']
            }
          }
        ],
        excludeAcceptAllOption: true,
        multiple: false
      };

      // Call Chrome/Edge/Opera showOpenFilePicker API
      const [fileHandle] = await (window as any).showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      await processAndStoreFile(file);
    } catch (err: any) {
      // User cancelled or security permission rejected
      if (err.name !== 'AbortError') {
        console.warn('FileSystem API error, falling back to traditional file picker:', err);
        fileInputRef.current?.click();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Traditional File Input picker
  const handleTraditionalFilePicker = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      try {
        await processAndStoreFile(e.target.files[0]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Drag and Drop support
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsProcessing(true);
      try {
        await processAndStoreFile(e.dataTransfer.files[0]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Optimize and persist image helper
  const processAndStoreFile = async (file: File) => {
    try {
      const optimizedPkg = await optimizeUploadedImage(file);
      const folderName = selectedFolder === 'all' ? 'banners' : selectedFolder;
      
      const newMedia: MediaFile = {
        id: optimizedPkg.id,
        name: optimizedPkg.name,
        folder: folderName,
        url: optimizedPkg.desktop, // Desktop resolution base64 or URL
        size: optimizedPkg.optimizedSize,
        dimensions: '1200xH (Optimized)',
        filePath: `${folderName}/${optimizedPkg.name}`,
        uploadedAt: new Date().toISOString(),
        altText: optimizedPkg.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
      };

      const existing = getMediaLibrary();
      const updated = [newMedia, ...existing];
      setMediaList(updated);
      saveMediaLibrary(updated);
      
      addActivityLog(
        'Staff',
        'Media Management',
        `Uploaded & Auto-optimized file "${file.name}" via FileSystem API`
      );
      
      // Auto-select newly uploaded image
      setSelectedMedia(newMedia);
    } catch (err) {
      console.error('Image processing failure:', err);
      alert('We could not optimize your image file. Please check if it is a valid PNG, JPG or WebP image.');
    }
  };

  const handleDeleteMedia = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}"? This will remove it from the system and any sections referencing this image.`)) {
      const existing = getMediaLibrary();
      const filtered = existing.filter(item => item.id !== id);
      setMediaList(filtered);
      saveMediaLibrary(filtered);
      
      if (selectedMedia?.id === id) {
        setSelectedMedia(null);
      }
      addActivityLog('Staff', 'Media Management', `Deleted asset "${name}"`);
    }
  };

  const handleSaveMetadata = () => {
    if (!selectedMedia) return;
    
    const updatedMedia: MediaFile = {
      ...selectedMedia,
      name: editName,
      folder: editFolder,
      filePath: editFilePath,
      altText: editAltText
    };

    const newList = mediaList.map(item => item.id === selectedMedia.id ? updatedMedia : item);
    setMediaList(newList);
    saveMediaLibrary(newList);
    setSelectedMedia(updatedMedia);
    setIsEditingMetadata(false);

    addActivityLog('Staff', 'Media Management', `Updated metadata for asset "${editName}"`);
  };

  const handleSaveEditedImage = (updatedMedia: MediaFile) => {
    const newList = mediaList.map(item => item.id === updatedMedia.id ? updatedMedia : item);
    setMediaList(newList);
    saveMediaLibrary(newList);
    setSelectedMedia(updatedMedia);
    
    addActivityLog(
      'Staff', 
      'Media Management', 
      `Saved custom crops, resizing adjustments, and focal coordinates for "${updatedMedia.name}"`
    );
  };

  const handleCopyReference = (media: MediaFile) => {
    navigator.clipboard.writeText(media.url);
    setCopiedId(media.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtration and search metrics
  const folders = ['all', 'banners', 'tours', 'avatars', 'safaris'];
  
  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.folder.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0A1224] border border-white/5 p-6 rounded-3xl ${className}`}>
      
      {/* LEFT: File Upload area & assets list */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Header / File System picker status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#121B30]/30 p-4 rounded-2xl border border-white/5">
          <div>
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <FolderOpen size={16} className="text-[#D4A017]" />
              <span>Media Drive & Storage</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {hasFileSystemSupport 
                ? '⚡ Modern File System Access API active • Direct Local Picker' 
                : '📂 Legacy Browser Sandbox active • Safe Multi-Format Sandbox'}
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleFileSystemPicker}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial bg-[#D4A017] hover:bg-[#b8860b] disabled:opacity-50 text-[#020C1F] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Upload size={14} />
              <span>Upload local image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleTraditionalFilePicker}
            />
          </div>
        </div>

        {/* Drag and Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSystemPicker}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[140px] ${
            isDragging
              ? 'border-[#D4A017] bg-[#D4A017]/10'
              : 'border-white/10 hover:border-[#D4A017]/40 hover:bg-[#121B30]/30'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin text-[#D4A017]" size={28} />
              <p className="text-xs font-bold text-slate-200">Analyzing, resizing and compressing image formats...</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-slate-800/40 rounded-full text-slate-400">
                <Upload size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Drag & drop files here, or click to explore computer</p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG, WebP (Optimized to WebP automatically to maintain 95+ PageSpeed)</p>
              </div>
            </>
          )}
        </div>

        {/* Search & Folder filters */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A017]"
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={13} />
          </div>

          <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            {folders.map(folderName => (
              <button
                key={folderName}
                onClick={() => setSelectedFolder(folderName)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedFolder === folderName ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 hover:text-slate-200'
                }`}
              >
                {folderName}
              </button>
            ))}
          </div>
        </div>

        {/* Media grid */}
        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredMedia.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className={`bg-[#121B30] rounded-2xl overflow-hidden border transition-all relative group flex flex-col justify-between h-44 cursor-pointer ${
                  selectedMedia?.id === item.id 
                    ? 'border-[#D4A017] ring-2 ring-[#D4A017]/30' 
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="relative h-28 bg-slate-950 overflow-hidden">
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                  
                  {/* Select indicator */}
                  {selectedMedia?.id === item.id && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="bg-[#D4A017] text-[#020C1F] p-1.5 rounded-full">
                        <Check size={14} className="stroke-[3px]" />
                      </div>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 bg-black/60 text-slate-300 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                    {item.folder}
                  </span>
                </div>

                <div className="p-2 bg-[#0C1527] border-t border-white/5 flex flex-col justify-between flex-1">
                  <p className="text-[10px] font-bold text-slate-200 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[9px] text-slate-400 flex justify-between mt-0.5">
                    <span>{item.size}</span>
                    <span>Use</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#121B30]/10 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
            <ImageIcon className="text-slate-600 animate-bounce" size={40} />
            <div>
              <p className="font-bold text-slate-300 text-sm">No match found</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the folder filter or search query.</p>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: Selected asset info, preview, copy reference, delete */}
      <div className="lg:col-span-4 bg-[#121B30]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-fit min-h-[450px]">
        {selectedMedia ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Selected Image Info
              </span>
              <button
                onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                className="text-[10px] text-[#D4A017] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                {isEditingMetadata ? 'Cancel Edit' : 'Edit Details'}
              </button>
            </div>

            {/* Main Preview */}
            <div className="relative rounded-xl overflow-hidden aspect-video border border-white/10 bg-slate-950 flex items-center justify-center">
              <img src={selectedMedia.url} alt={selectedMedia.name} className="w-full h-full object-cover" />
            </div>

            {/* Metadata information */}
            {isEditingMetadata ? (
              <div className="space-y-3 bg-[#0A1224] p-3 rounded-xl border border-white/5 text-xs text-slate-300">
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-semibold block mb-1">File Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#121B30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-semibold block mb-1">Target Folder</label>
                  <select
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                    className="w-full bg-[#121B30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  >
                    <option value="banners">banners</option>
                    <option value="tours">tours</option>
                    <option value="avatars">avatars</option>
                    <option value="safaris">safaris</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-semibold block mb-1">Custom File Path</label>
                  <input
                    type="text"
                    value={editFilePath}
                    onChange={(e) => setEditFilePath(e.target.value)}
                    className="w-full bg-[#121B30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-semibold block mb-1">Alt Text</label>
                  <textarea
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    rows={2}
                    placeholder="Describe this image for screen readers & SEO..."
                    className="w-full bg-[#121B30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4A017] resize-none"
                  />
                </div>
                <button
                  onClick={handleSaveMetadata}
                  className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer mt-1"
                >
                  <Check size={13} className="stroke-[3px]" />
                  <span>Save Metadata Changes</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 bg-[#0A1224] p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-semibold">File Name</span>
                  <span className="text-xs text-slate-200 break-all font-medium block mt-0.5">{selectedMedia.name}</span>
                </div>
                {selectedMedia.altText && (
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Alt Text (SEO)</span>
                    <span className="text-xs text-slate-300 block mt-0.5 italic">"{selectedMedia.altText}"</span>
                  </div>
                )}
                {selectedMedia.filePath && (
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">File Path Reference</span>
                    <span className="text-xs text-slate-300 font-mono block mt-0.5 break-all">{selectedMedia.filePath}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 mt-1">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">File Size</span>
                    <span className="text-xs text-emerald-400 font-bold block mt-0.5">{selectedMedia.size}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Resolution</span>
                    <span className="text-xs text-slate-300 font-mono block mt-0.5">{selectedMedia.dimensions}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Database Folder</span>
                    <span className="text-xs text-[#D4A017] font-bold uppercase tracking-wider block mt-0.5">{selectedMedia.folder}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Upload Date</span>
                    <span className="text-[10px] text-slate-300 block mt-0.5">
                      {selectedMedia.uploadedAt ? new Date(selectedMedia.uploadedAt).toLocaleDateString() : 'Pre-installed'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {onSelectImage && (
                <button
                  onClick={() => onSelectImage(selectedMedia.url)}
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check size={14} />
                  <span>Insert / Choose Image</span>
                </button>
              )}

              <button
                onClick={() => setIsEditorOpen(true)}
                className="w-full bg-[#1A2E4C] hover:bg-[#253f66] text-[#D4A017] text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#D4A017]/25"
              >
                <Edit size={14} />
                <span>Crop, Resize & Focus</span>
              </button>

              <button
                onClick={() => handleCopyReference(selectedMedia)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === selectedMedia.id ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Reference Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Path / URL Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDeleteMedia(selectedMedia.id, selectedMedia.name)}
                className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-500/15 text-red-400 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Asset Completely</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 h-full space-y-3">
            <div className="p-3 bg-[#121B30] rounded-full border border-white/5 text-slate-500">
              <FileImage size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-300 text-xs">No image selected</p>
              <p className="text-[10px] text-slate-500 mt-1">Select an item from the library grid to insert, copy references or configure metadata</p>
            </div>
          </div>
        )}

        {/* Helpful Tip footer */}
        <div className="mt-4 bg-[#D4A017]/5 border border-[#D4A017]/10 p-3 rounded-xl flex gap-2 items-start text-slate-400 text-[10px] leading-relaxed">
          <Info size={14} className="text-[#D4A017] shrink-0 mt-0.5" />
          <span>
            Uploaded images are processed directly inside your browser cache using canvas algorithms, keeping resolution crisp but saving over 70% file weight before DB saving.
          </span>
        </div>
      </div>

      {/* Advanced Image Editor Overlay Modal */}
      {selectedMedia && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          media={selectedMedia}
          onSave={handleSaveEditedImage}
        />
      )}

    </div>
  );
}
