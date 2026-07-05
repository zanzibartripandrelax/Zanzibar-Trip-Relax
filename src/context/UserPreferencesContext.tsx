import React, { createContext, useContext, useState, useEffect } from 'react';
import { tours, Tour } from '../data/tours';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'TZS';

export interface UserProfile {
  budget: number; // Max price in USD
  duration: number; // Max duration in hours/days (scaled)
  travelStyle: string; // 'Family' | 'Couple' | 'Solo' | 'Adventure' | 'Luxury' | 'Beach' | 'Safari' | 'Culture' | 'Wellness'
  recentlyViewed: string[]; // Tour IDs
  favorites: string[]; // Tour IDs
}

interface UserPreferencesContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  favorites: string[];
  toggleFavorite: (tourId: string) => void;
  recentlyViewed: string[];
  addRecentlyViewed: (tourId: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  formatPrice: (priceString: string) => string;
  getRecommendations: () => Tour[];
}

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  TZS: 2650,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  TZS: 'TZS ',
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('ztr_currency');
    return (saved as Currency) || 'USD';
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ztr_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('ztr_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = sessionStorage.getItem('ztr_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback below
      }
    }
    return {
      budget: 1000,
      duration: 10,
      travelStyle: 'All',
      recentlyViewed: [],
      favorites: []
    };
  });

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('ztr_currency', curr);
  };

  const toggleFavorite = (tourId: string) => {
    setFavorites(prev => {
      const next = prev.includes(tourId) ? prev.filter(id => id !== tourId) : [...prev, tourId];
      localStorage.setItem('ztr_favorites', JSON.stringify(next));
      return next;
    });
  };

  const addRecentlyViewed = (tourId: string) => {
    if (!tourId) return;
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== tourId);
      const next = [tourId, ...filtered].slice(0, 10); // Keep last 10
      sessionStorage.setItem('ztr_recently_viewed', JSON.stringify(next));
      return next;
    });
  };

  const updateUserProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...newProfile };
      sessionStorage.setItem('ztr_user_profile', JSON.stringify(next));
      return next;
    });
  };

  // Safe and precise price parser + converter
  const formatPrice = (priceString: string): string => {
    if (!priceString) return '';
    if (currency === 'USD') return priceString;

    // Matches numbers like $150 or $ 45 or 1200 or 1,200 (including decimals)
    const numMatch = priceString.match(/([0-9,]+)/);
    if (!numMatch) return priceString;

    const usdVal = parseFloat(numMatch[1].replace(/,/g, ''));
    if (isNaN(usdVal)) return priceString;

    const rate = EXCHANGE_RATES[currency];
    const convertedVal = usdVal * rate;

    let formattedVal = '';
    if (currency === 'TZS') {
      // For TZS, round to the nearest 1,000 for realistic pricing
      const rounded = Math.round(convertedVal / 1000) * 1000;
      formattedVal = rounded.toLocaleString('en-US');
    } else {
      formattedVal = Math.round(convertedVal).toLocaleString('en-US');
    }

    const symbol = CURRENCY_SYMBOLS[currency];
    return priceString.replace(/\$[0-9,]+/g, `${symbol}${formattedVal}`).replace(/[0-9,]+/g, formattedVal).replace('$', symbol);
  };

  // High performance, non-blocking tour recommender based on preferences and profile
  const getRecommendations = (): Tour[] => {
    // Score each static tour
    const scoredTours = tours.map(tour => {
      let score = 0;

      // 1. Match Budget
      // Parse numerical price
      const priceMatch = tour.price.match(/([0-9,]+)/);
      const priceVal = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
      if (priceVal > 0) {
        if (priceVal <= userProfile.budget) {
          score += 15; // Within budget
        } else {
          // Soft penalty for over-budget
          const pctOver = (priceVal - userProfile.budget) / userProfile.budget;
          score -= Math.min(20, Math.round(pctOver * 15));
        }
      }

      // 2. Match Category / Travel Style
      const category = tour.category.toLowerCase();
      const style = userProfile.travelStyle.toLowerCase();

      if (style !== 'all') {
        if (category === style) {
          score += 30; // Direct match
        } else if (
          (style === 'adventure' && (category === 'nature' || category === 'ocean')) ||
          (style === 'beach' && category === 'ocean') ||
          (style === 'culture' && category === 'island') ||
          (style === 'luxury' && tour.badge?.toLowerCase().includes('signature'))
        ) {
          score += 15; // Semantic sub-match
        }
      }

      // 3. Favourites/Recently Viewed boosts
      if (favorites.includes(tour.id)) {
        score -= 5; // Demote slightly so they see NEW recommendations, but keep high enough
      }
      if (recentlyViewed.includes(tour.id)) {
        score += 10; // Boost similar categories as recently viewed
        const recentTour = tours.find(t => t.id === tour.id);
        if (recentTour && recentTour.category === tour.category && recentTour.id !== tour.id) {
          score += 20; // High boost for tours in same category as recently viewed!
        }
      }

      return { tour, score };
    });

    // Sort by highest score first and pick top 3
    return scoredTours
      .sort((a, b) => b.score - a.score)
      .map(item => item.tour)
      .slice(0, 3);
  };

  return (
    <UserPreferencesContext.Provider value={{
      currency,
      setCurrency,
      favorites,
      toggleFavorite,
      recentlyViewed,
      addRecentlyViewed,
      userProfile,
      updateUserProfile,
      formatPrice,
      getRecommendations
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
