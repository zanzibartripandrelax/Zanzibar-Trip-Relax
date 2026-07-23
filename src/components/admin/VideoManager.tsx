import React, { useState } from 'react';
import { Play, Youtube, Plus, Trash2, Edit2, CheckCircle2, ExternalLink, RefreshCw, X, Eye } from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail, YoutubeVideo, addActivityLog } from '../../lib/cmsStore';

interface VideoManagerProps {
  videos: YoutubeVideo[];
  onSaveVideos: (updated: YoutubeVideo[]) => void;
  session?: any;
  isCMSReadOnly?: boolean;
}

export function VideoManager({ videos = [], onSaveVideos, session, isCMSReadOnly }: VideoManagerProps) {
  const [editingVideo, setEditingVideo] = useState<Partial<YoutubeVideo> | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [detectedId, setDetectedId] = useState<string | null>(null);

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    const id = extractYouTubeId(url);
    setDetectedId(id);
    if (editingVideo) {
      setEditingVideo({
        ...editingVideo,
        url,
        embedId: id || editingVideo.embedId || ''
      });
    }
  };

  const handleStartAdd = () => {
    setEditingVideo({
      id: 'yt-' + Date.now(),
      title: '',
      url: '',
      description: '',
      embedId: ''
    });
    setUrlInput('');
    setDetectedId(null);
  };

  const handleStartEdit = (video: YoutubeVideo) => {
    setEditingVideo({ ...video });
    setUrlInput(video.url || '');
    setDetectedId(video.embedId || extractYouTubeId(video.url));
  };

  const handleSaveCurrent = () => {
    if (!editingVideo) return;
    const cleanId = detectedId || extractYouTubeId(editingVideo.url || urlInput);
    if (!cleanId) {
      alert('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=COH39I_8Vv8 or https://youtu.be/COH39I_8Vv8)');
      return;
    }

    if (!editingVideo.title?.trim()) {
      alert('Please provide a title for this video story.');
      return;
    }

    const newVideo: YoutubeVideo = {
      id: editingVideo.id || 'yt-' + Date.now(),
      title: editingVideo.title.trim(),
      url: editingVideo.url || urlInput,
      embedId: cleanId,
      description: editingVideo.description?.trim() || ''
    };

    const existsIndex = videos.findIndex(v => v.id === newVideo.id);
    let updatedList: YoutubeVideo[];
    if (existsIndex >= 0) {
      updatedList = [...videos];
      updatedList[existsIndex] = newVideo;
    } else {
      updatedList = [newVideo, ...videos];
    }

    onSaveVideos(updatedList);
    addActivityLog(session?.name || 'Owner / Admin', 'Video Management', `Saved YouTube Video "${newVideo.title}" (ID: ${cleanId})`);
    setEditingVideo(null);
    setUrlInput('');
    setDetectedId(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove video "${title}"?`)) {
      const updatedList = videos.filter(v => v.id !== id);
      onSaveVideos(updatedList);
      addActivityLog(session?.name || 'Owner / Admin', 'Video Management', `Removed YouTube Video "${title}"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0A1224] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Youtube className="text-red-500" size={22} />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">YouTube Video Manager</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Paste YouTube URLs to publish cinematic video stories. The system automatically extracts video IDs, generates HD thumbnails, and creates embedded players.
            </p>
          </div>

          <button
            onClick={handleStartAdd}
            disabled={isCMSReadOnly}
            className="px-5 py-2.5 bg-[#D4A017] hover:bg-[#b88a10] text-[#020C1F] text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-[#D4A017]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus size={16} />
            <span>Add YouTube Video</span>
          </button>
        </div>
      </div>

      {/* Editor Modal / Panel */}
      {editingVideo && (
        <div className="bg-[#0A1224] border-2 border-[#D4A017] rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider flex items-center gap-2">
              <Youtube size={18} />
              <span>{editingVideo.id ? 'Edit YouTube Video Story' : 'New YouTube Video Story'}</span>
            </h3>
            <button onClick={() => setEditingVideo(null)} className="text-slate-400 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Video Title *</label>
                <input
                  type="text"
                  value={editingVideo.title || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  placeholder="e.g. Swimming with Dolphins in Mnemba Atoll 4K"
                  className="w-full bg-[#081835] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#D4A017] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">YouTube Video URL *</label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=COH39I_8Vv8 or https://youtu.be/COH39I_8Vv8"
                  className="w-full bg-[#081835] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#D4A017] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports standard YouTube links, shortened youtu.be links, or embed links.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Video Highlight Summary</label>
                <textarea
                  rows={3}
                  value={editingVideo.description || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  placeholder="Brief summary shown on homepage video story cards..."
                  className="w-full bg-[#081835] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#D4A017] outline-none resize-none"
                />
              </div>
            </div>

            {/* Live Auto Extraction & Preview Card */}
            <div className="bg-[#081835] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
                  <span>Auto-Extracted Preview</span>
                  {detectedId && (
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      ID: {detectedId}
                    </span>
                  )}
                </h4>

                {detectedId ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                      <img
                        src={getYouTubeThumbnail(detectedId)}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button
                          onClick={() => setPreviewVideoUrl(getYouTubeEmbedUrl(detectedId))}
                          className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Play size={20} className="fill-white ml-0.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                      <p>Embed URL: https://www.youtube.com/embed/{detectedId}</p>
                      <p>Thumbnail: https://img.youtube.com/vi/{detectedId}/hqdefault.jpg</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                    <Youtube size={32} className="mb-2 text-slate-600" />
                    <span>Paste a valid YouTube link above to automatically extract thumbnail and embed player</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCurrent}
                  disabled={!detectedId}
                  className="px-5 py-2 bg-[#D4A017] text-[#020C1F] text-xs font-bold rounded-xl disabled:opacity-40 cursor-pointer"
                >
                  Save Video Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const ytId = video.embedId || extractYouTubeId(video.url);
          const thumb = ytId ? getYouTubeThumbnail(ytId) : '';

          return (
            <div key={video.id} className="bg-[#0A1224] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="relative aspect-video bg-black overflow-hidden group">
                  {thumb ? (
                    <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Youtube size={40} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {ytId && (
                      <button
                        onClick={() => setPreviewVideoUrl(getYouTubeEmbedUrl(ytId))}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Preview</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">{video.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {video.description || 'No description provided.'}
                  </p>
                  {ytId && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      YouTube ID: {ytId}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-white/5 flex items-center justify-between">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#D4A017] hover:underline flex items-center gap-1"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink size={12} />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(video)}
                    disabled={isCMSReadOnly}
                    className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs cursor-pointer"
                    title="Replace / Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id, video.title)}
                    disabled={isCMSReadOnly}
                    className="p-1.5 bg-red-950/60 text-red-400 hover:text-red-300 rounded-lg text-xs cursor-pointer"
                    title="Delete Video"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-[#0A1224] border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#081835]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Youtube className="text-red-500" size={18} />
                <span>Embedded YouTube Player Preview</span>
              </div>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <iframe
                src={previewVideoUrl}
                title="YouTube Video Preview"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
