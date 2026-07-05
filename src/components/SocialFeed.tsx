import { useState } from 'react';
import { Play, Compass, Sparkles, Youtube, Clock, ExternalLink } from 'lucide-react';
import { getSiteContent, YoutubeVideo } from '../lib/cmsStore';
import { motion, AnimatePresence } from 'motion/react';

export default function SocialFeed() {
  const content = getSiteContent();
  const videos: YoutubeVideo[] = content.youtubeVideos || [
    {
      id: 'yt-1',
      title: 'Zanzibar Vacation Travel Guide 4K',
      url: 'https://www.youtube.com/watch?v=COH39I_8Vv8',
      embedId: 'COH39I_8Vv8',
      description: 'Explore the stunning beaches and historical streets of Zanzibar in pristine 4K resolution.'
    },
    {
      id: 'yt-2',
      title: 'Nakupenda Sandbank Beach Bliss',
      url: 'https://www.youtube.com/watch?v=L38fR_vK-iU',
      embedId: 'L38fR_vK-iU',
      description: 'Experience Nakupenda Sandbank, a magical tropical paradise off the coast of Stone Town.'
    },
    {
      id: 'yt-3',
      title: 'Tanzania Wildlife Safari Serengeti',
      url: 'https://www.youtube.com/watch?v=aD77-k1tZxs',
      embedId: 'aD77-k1tZxs',
      description: 'Witness the incredible lions, leopards, and giant elephant herds roaming the Serengeti plains.'
    }
  ];

  const [activeVideo, setActiveVideo] = useState<YoutubeVideo | null>(null);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);

  // Parse Youtube URL helper to extract ID if they insert full link
  const getYoutubeId = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : '';
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full bg-slate-50/75 py-16 px-4 md:px-8 border-t border-b border-slate-100 rounded-[2.5rem] relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#0B3B8C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-150/60 rounded-full select-none">
            <Youtube size={14} className="text-red-600 fill-red-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 font-mono">
              Official Video Channel
            </span>
          </div>
          
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Zanzibar Trip Video Gallery
          </h3>
          
          <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto font-medium leading-relaxed">
            Experience the vibrant colors, pristine sands, and spectacular wildlife adventures of Zanzibar &amp; Tanzania. Watch our high-production-value video logs directly below.
          </p>
          <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-4 rounded-full" />
        </div>

        {/* Featured Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Large Featured Video Player Card */}
          <div className="lg:col-span-2 bg-white p-4.5 rounded-3xl border border-slate-150 shadow-md">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
              {isPlayingId ? (
                <iframe
                  title="Featured Video Player"
                  src={`https://www.youtube.com/embed/${isPlayingId}?autoplay=1`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer" onClick={() => setIsPlayingId(getYoutubeId(videos[0].url) || videos[0].embedId)}>
                  <img
                    src={`https://img.youtube.com/vi/${getYoutubeId(videos[0].url) || videos[0].embedId}/maxresdefault.jpg`}
                    alt={videos[0].title}
                    className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.02]"
                    onError={(e) => {
                      // Fallback if maxresdefault doesn't exist
                      e.currentTarget.src = `https://img.youtube.com/vi/${getYoutubeId(videos[0].url) || videos[0].embedId}/hqdefault.jpg`;
                    }}
                  />
                  {/* Subtle dark overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  
                  {/* Floating Play Button */}
                  <div className="relative z-10 w-20 h-20 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110 active:scale-95">
                    <Play size={32} className="fill-white ml-1.5 text-white" />
                  </div>

                  {/* Play label overlay */}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5 text-xs font-bold font-mono">
                    <Clock size={12} className="text-[#D4A017]" />
                    <span>PLAY VIDEO INLINE</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#D4A017]/10 text-[#D4A017] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} className="fill-[#D4A017]" />
                  <span>Featured Broadcast</span>
                </span>
                <span className="bg-[#0B3B8C]/10 text-[#0B3B8C] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  4K Ultra HD
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-extrabold text-[#0B3B8C] tracking-tight">
                {videos[0].title}
              </h4>
              <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
                {videos[0].description || 'Watch our premier showcase video capturing top-rated spots across Zanzibar.'}
              </p>
            </div>
          </div>

          {/* Side Playlist of other videos */}
          <div className="space-y-4">
            <h5 className="text-[#0B3B8C] text-xs font-black uppercase tracking-widest font-mono mb-2">
              Latest Highlights
            </h5>
            
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
              {videos.map((video, idx) => {
                const vidId = getYoutubeId(video.url) || video.embedId;
                const isCurrent = isPlayingId === vidId;
                return (
                  <div
                    key={video.id || idx}
                    onClick={() => setIsPlayingId(vidId)}
                    className={`group cursor-pointer p-3.5 bg-white border rounded-2xl transition-all duration-300 flex gap-4 hover:shadow-md ${
                      isCurrent ? 'border-[#D4A017] ring-1 ring-[#D4A017]/40 bg-[#D4A017]/5' : 'border-slate-150 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative w-28 aspect-video shrink-0 bg-slate-100 rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={`https://img.youtube.com/vi/${vidId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                          <Play size={12} className="fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h6 className={`font-extrabold text-xs leading-snug line-clamp-2 transition-colors ${
                          isCurrent ? 'text-[#D4A017]' : 'text-[#0B3B8C] group-hover:text-[#D4A017]'
                        }`}>
                          {video.title}
                        </h6>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {video.description || 'Watch direct video stream'}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Compass size={10} className="text-[#D4A017]" />
                        <span>PLAY NOW</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA to channel */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#0B3B8C] hover:bg-[#082d6b] text-white text-xs font-black py-4.5 rounded-2xl transition-all uppercase tracking-widest shadow-sm cursor-pointer"
            >
              <Youtube size={15} fill="white" />
              <span>Subscribe on YouTube</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Extra promotional content container */}
        <div className="mt-12 bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 shrink-0">
              <Youtube size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#0B3B8C] uppercase tracking-wide">Are you looking for more visual inspirations?</h4>
              <p className="text-xs text-slate-500 mt-0.5">We continuously publish pristine 4K virtual tours, guide vlogs, and customer feedback videos directly on our official YouTube channel.</p>
            </div>
          </div>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-extrabold uppercase tracking-widest text-red-600 hover:text-white transition-all bg-red-50 hover:bg-red-600 px-5 py-3 rounded-xl border border-red-100 whitespace-nowrap cursor-pointer shrink-0"
          >
            Open Channel Page
          </a>
        </div>
      </div>
    </div>
  );
}
