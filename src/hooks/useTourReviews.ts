import { useState, useEffect } from 'react';

export interface TourReview {
  id: string;
  tourId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export function useTourReviews(tourId?: string) {
  const [reviews, setReviews] = useState<TourReview[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ztr_tour_reviews');
    if (saved) {
      try {
        const allReviews: TourReview[] = JSON.parse(saved);
        if (tourId) {
          setReviews(allReviews.filter(r => r.tourId === tourId));
        } else {
          setReviews(allReviews);
        }
      } catch (e) {
        console.error('Failed to parse reviews', e);
      }
    }
  }, [tourId]);

  const addReview = (review: Omit<TourReview, 'id' | 'date'>) => {
    const newReview: TourReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    const saved = localStorage.getItem('ztr_tour_reviews');
    const allReviews: TourReview[] = saved ? JSON.parse(saved) : [];
    const next = [newReview, ...allReviews];
    
    localStorage.setItem('ztr_tour_reviews', JSON.stringify(next));
    
    if (tourId && review.tourId === tourId) {
      setReviews(prev => [newReview, ...prev]);
    } else if (!tourId) {
      setReviews(next);
    }
    
    return newReview;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  return {
    reviews,
    addReview,
    getAverageRating,
    totalReviews: reviews.length
  };
}
