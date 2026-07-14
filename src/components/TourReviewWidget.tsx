import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TourReviewWidgetProps {
  tourId: string;
  tourName: string;
  onSuccess?: () => void;
}

const TourReviewWidget: React.FC<TourReviewWidgetProps> = ({ tourId, tourName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const saved = localStorage.getItem('ztr_tour_reviews');
      const allReviews = saved ? JSON.parse(saved) : [];
      
      const newReview = {
        id: `rev-${Date.now()}`,
        tourId,
        userName: userName || 'Anonymous Traveler',
        rating,
        comment,
        date: new Date().toISOString().split('T')[0],
        isVerified: true
      };
      
      localStorage.setItem('ztr_tour_reviews', JSON.stringify([newReview, ...allReviews]));
      
      setIsSubmitting(false);
      setSubmitted(true);
      if (onSuccess) onSuccess();
    }, 800);
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-4"
      >
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
          <CheckCircle2 className="text-white" size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-emerald-900">Review Submitted!</h3>
          <p className="text-emerald-700 text-sm">Asante! Your feedback helps other travelers discover Zanzibar.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Rate Your Experience</h3>
        <p className="text-slate-500 text-sm mt-1">Share your thoughts on the <span className="text-[#0B3B8C] font-bold">{tourName}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-all duration-200 hover:scale-110"
              >
                <Star
                  size={32}
                  className={`transition-colors ${
                    (hover || rating) >= star 
                      ? 'fill-[#D4A017] text-[#D4A017]' 
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Sarah J."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]/10 focus:border-[#0B3B8C] transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Review Details</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Tell us about the highlights, the guides, and the island vibes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]/10 focus:border-[#0B3B8C] transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] disabled:bg-slate-300 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={18} />
              Submit My Review
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TourReviewWidget;
