import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Building, Plane, Navigation, Check, Sparkles, X } from 'lucide-react';

export interface PlaceResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface GooglePlacesAutocompleteProps {
  label: string;
  value: string;
  onChange: (place: PlaceResult) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  popularPresets?: { name: string; address: string; lat: number; lng: number; iconType?: string }[];
  id?: string;
}

const ZANZIBAR_DEFAULT_PRESETS = [
  { name: 'Zanzibar Intl Airport (ZNZ)', address: 'Abeid Amani Karume International Airport, Kisauni, Zanzibar', lat: -6.2220, lng: 39.2248, iconType: 'airport' },
  { name: 'Stone Town Ferry Terminal', address: 'Malindi Ferry Terminal, Stone Town, Zanzibar Port', lat: -6.1585, lng: 39.1915, iconType: 'ferry' },
  { name: 'Stone Town Hotels (Old Fort)', address: 'Mizingani Rd, Stone Town, Zanzibar', lat: -6.1612, lng: 39.1897, iconType: 'hotel' },
  { name: 'Nungwi Beach Resorts', address: 'Nungwi Beach, North Coast, Zanzibar', lat: -5.7262, lng: 39.2891, iconType: 'beach' },
  { name: 'Kendwa Rocks Beach', address: 'Kendwa Beach, North West Coast, Zanzibar', lat: -5.7508, lng: 39.2882, iconType: 'beach' },
  { name: 'Paje Beach Resort Area', address: 'Paje Main Beach, East Coast, Zanzibar', lat: -6.2662, lng: 39.5338, iconType: 'beach' },
  { name: 'Jambiani Beach Village', address: 'Jambiani Beach, South East Coast, Zanzibar', lat: -6.3190, lng: 39.5482, iconType: 'beach' },
  { name: 'Kiwengwa Beach Hotels', address: 'Kiwengwa, North East Coast, Zanzibar', lat: -5.9920, lng: 39.3780, iconType: 'beach' },
  { name: 'Matemwe Beach Village', address: 'Matemwe, Opposite Mnemba Atoll, Zanzibar', lat: -5.8700, lng: 39.3520, iconType: 'beach' },
];

export default function GooglePlacesAutocomplete({
  label,
  value,
  onChange,
  placeholder = 'Search hotel, airport, beach, street...',
  icon = <MapPin size={18} className="text-[#0B3B8C]" />,
  popularPresets = ZANZIBAR_DEFAULT_PRESETS,
  id
}: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  // Sync internal input query when prop changes from outside
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Initialize Google Places Autocomplete Service if Google Maps JS SDK is present
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
      if (!placesServiceRef.current) {
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
      }
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    setIsOpen(true);

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    // Try Google Maps Autocomplete Service
    if (autocompleteServiceRef.current) {
      setIsLoading(true);
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: text,
          locationBias: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(-6.5, 39.1), // Zanzibar SW
            new window.google.maps.LatLng(-5.6, 39.6)  // Zanzibar NE
          ),
          componentRestrictions: { country: 'tz' }
        },
        (predictions: any[], status: any) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            // Fallback: search locally in Zanzibar preset list
            filterLocalPresets(text);
          }
        }
      );
    } else {
      filterLocalPresets(text);
    }
  };

  const filterLocalPresets = (text: string) => {
    const q = text.toLowerCase();
    const filtered = popularPresets.filter(
      p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    );
    setSuggestions(filtered.map(p => ({
      isLocal: true,
      description: `${p.name} (${p.address})`,
      structured_formatting: { main_text: p.name, secondary_text: p.address },
      localData: p
    })));
  };

  const handleSelectPrediction = (item: any) => {
    if (item.isLocal && item.localData) {
      const p = item.localData;
      setQuery(p.name);
      onChange({
        name: p.name,
        address: p.address,
        lat: p.lat,
        lng: p.lng
      });
      setIsOpen(false);
      return;
    }

    if (item.place_id && placesServiceRef.current) {
      setIsLoading(true);
      placesServiceRef.current.getDetails(
        {
          placeId: item.place_id,
          fields: ['name', 'formatted_address', 'geometry', 'place_id']
        },
        (place: any, status: any) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const name = place.name || item.structured_formatting?.main_text || 'Selected Location';
            const address = place.formatted_address || item.description || name;

            setQuery(name);
            onChange({
              name,
              address,
              lat,
              lng,
              placeId: place.place_id
            });
            setIsOpen(false);
          } else {
            // Fallback if details lookup failed
            const name = item.structured_formatting?.main_text || item.description;
            setQuery(name);
            onChange({
              name,
              address: item.description,
              lat: -6.1659,
              lng: 39.2026,
              placeId: item.place_id
            });
            setIsOpen(false);
          }
        }
      );
    } else {
      setQuery(item.description);
      onChange({
        name: item.description,
        address: item.description,
        lat: -6.1659,
        lng: 39.2026
      });
      setIsOpen(false);
    }
  };

  const handleSelectPreset = (preset: typeof popularPresets[0]) => {
    setQuery(preset.name);
    onChange({
      name: preset.name,
      address: preset.address,
      lat: preset.lat,
      lng: preset.lng
    });
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-1.5" ref={dropdownRef} id={id}>
      <label className="block text-xs font-bold text-[#0B3B8C] uppercase tracking-wider flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Google Maps Autocomplete
        </span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 outline-none transition-all shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(true);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Popular Zanzibar Quick Pick Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Quick Picks:</span>
        {popularPresets.slice(0, 4).map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
              query === preset.name
                ? 'bg-[#0B3B8C] text-white border-[#0B3B8C] shadow-sm font-bold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 border-slate-200'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          {isLoading && (
            <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#0B3B8C] border-t-transparent rounded-full animate-spin" />
              Searching Google Maps locations...
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Google Maps Live Suggestions</span>
                <Sparkles size={12} className="text-[#D4A017]" />
              </div>
              {suggestions.map((item, index) => {
                const mainText = item.structured_formatting?.main_text || item.description || item.name;
                const secondaryText = item.structured_formatting?.secondary_text || item.address || '';
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectPrediction(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50/60 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <MapPin size={16} className="text-[#0B3B8C] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#0B3B8C] truncate">
                        {mainText}
                      </p>
                      {secondaryText && (
                        <p className="text-[11px] text-slate-500 truncate">
                          {secondaryText}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && suggestions.length === 0 && (
            <div className="p-3">
              <p className="text-xs text-slate-500 font-semibold mb-2">Popular Zanzibar Transfer Hotspots:</p>
              <div className="space-y-1">
                {popularPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                  >
                    <Building size={14} className="text-[#0B3B8C] shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 block">{preset.address}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
