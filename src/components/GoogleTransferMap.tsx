import React, { useEffect, useState, useRef, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Compass, MapPin, Navigation, Clock, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { PlaceResult } from './GooglePlacesAutocomplete';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

interface GoogleTransferMapProps {
  pickup: PlaceResult | null;
  destination: PlaceResult | null;
  onRouteCalculated?: (stats: { distanceKm: number; durationText: string; routePath?: { lat: number; lng: number }[] }) => void;
  heightClass?: string;
}

// Inner component that interacts with the loaded Google Map instance
function RouteRenderer({
  pickup,
  destination,
  onRouteCalculated
}: {
  pickup: PlaceResult | null;
  destination: PlaceResult | null;
  onRouteCalculated?: (stats: { distanceKm: number; durationText: string; routePath?: { lat: number; lng: number }[] }) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !pickup || !destination) return;
    if (pickup.lat === destination.lat && pickup.lng === destination.lng) return;

    // Clear previous polyline if any
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Try Google Maps DirectionsService
    if (window.google && window.google.maps) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: pickup.lat, lng: pickup.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            const route = result.routes[0];
            const leg = route.legs[0];

            const distanceMeters = leg.distance?.value || 0;
            const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10 || 15;
            const durationText = leg.duration?.text || `${Math.round(distanceKm * 1.3)} mins`;

            // Draw route polyline
            const polyline = new window.google.maps.Polyline({
              path: route.overview_path,
              geodesic: true,
              strokeColor: '#0B3B8C',
              strokeOpacity: 0.9,
              strokeWeight: 6,
            });
            polyline.setMap(map);
            polylineRef.current = polyline;

            // Fit bounds to fit the whole route
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(new window.google.maps.LatLng(pickup.lat, pickup.lng));
            bounds.extend(new window.google.maps.LatLng(destination.lat, destination.lng));
            map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });

            if (onRouteCalculated) {
              const pathPoints = route.overview_path.map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
              onRouteCalculated({ distanceKm, durationText, routePath: pathPoints });
            }
          } else {
            fallbackDistanceCalculation();
          }
        }
      );
    } else {
      fallbackDistanceCalculation();
    }

    function fallbackDistanceCalculation() {
      if (!pickup || !destination) return;
      // Haversine formula calculation with road winding factor
      const R = 6371; // Earth radius km
      const dLat = (destination.lat - pickup.lat) * Math.PI / 180;
      const dLng = (destination.lng - pickup.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pickup.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const straightDist = R * c;
      const roadDistKm = Math.max(3, Math.round(straightDist * 1.35 * 10) / 10);
      const durationMins = Math.round(roadDistKm * 1.4 + 5);
      const durationText = `${durationMins} mins`;

      if (onRouteCalculated) {
        onRouteCalculated({ distanceKm: roadDistKm, durationText });
      }

      if (map && window.google && window.google.maps) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(new window.google.maps.LatLng(pickup.lat, pickup.lng));
        bounds.extend(new window.google.maps.LatLng(destination.lat, destination.lng));
        map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
      }
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, pickup, destination]);

  return null;
}

export default function GoogleTransferMap({
  pickup,
  destination,
  onRouteCalculated,
  heightClass = 'h-80'
}: GoogleTransferMapProps) {
  const [distanceInfo, setDistanceInfo] = useState<{ distanceKm: number; durationText: string } | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  const defaultCenter = useMemo(() => {
    if (pickup) return { lat: pickup.lat, lng: pickup.lng };
    if (destination) return { lat: destination.lat, lng: destination.lng };
    return { lat: -6.1659, lng: 39.2026 }; // Stone Town / Zanzibar center
  }, [pickup, destination]);

  const handleRouteData = (stats: { distanceKm: number; durationText: string; routePath?: { lat: number; lng: number }[] }) => {
    setDistanceInfo(stats);
    if (onRouteCalculated) {
      onRouteCalculated(stats);
    }
  };

  const navUrl = useMemo(() => {
    if (!pickup || !destination) return '#';
    const originStr = encodeURIComponent(pickup.address || pickup.name);
    const destStr = encodeURIComponent(destination.address || destination.name);
    return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
  }, [pickup, destination]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 space-y-3 overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-[#0B3B8C] text-sm flex items-center gap-2">
            <Compass className="text-[#D4A017] animate-spin-slow" size={18} />
            Interactive Google Map Route
          </h4>
          <p className="text-[11px] text-slate-500 font-medium">Live road distance, driving route & duration</p>
        </div>

        {pickup && destination && (
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold bg-[#0B3B8C] text-white px-3 py-1.5 rounded-xl hover:bg-[#082E6E] transition-colors shadow-sm"
          >
            <span>Open in Google Maps</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Calculated Stats Banner */}
      {distanceInfo && (
        <div className="grid grid-cols-2 gap-3 bg-[#0B3B8C]/5 p-3 rounded-2xl border border-[#0B3B8C]/10 text-center animate-in fade-in duration-200">
          <div className="border-r border-[#0B3B8C]/10 pr-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Driving Distance
            </span>
            <span className="text-base font-black text-[#0B3B8C] font-mono">
              {distanceInfo.distanceKm} km
            </span>
          </div>
          <div className="pl-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Est. Travel Duration
            </span>
            <span className="text-base font-black text-[#D4A017] font-mono">
              {distanceInfo.durationText}
            </span>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100`}>
        {API_KEY ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={11}
              mapTypeId={mapType}
              mapId="ZANZIBAR_TRANSFER_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {pickup && (
                <AdvancedMarker position={{ lat: pickup.lat, lng: pickup.lng }} title={`Pickup: ${pickup.name}`}>
                  <Pin background="#059669" glyphColor="#FFFFFF" borderColor="#047857" />
                </AdvancedMarker>
              )}

              {destination && (
                <AdvancedMarker position={{ lat: destination.lat, lng: destination.lng }} title={`Drop-off: ${destination.name}`}>
                  <Pin background="#DC2626" glyphColor="#FFFFFF" borderColor="#B91C1C" />
                </AdvancedMarker>
              )}

              <RouteRenderer
                pickup={pickup}
                destination={destination}
                onRouteCalculated={handleRouteData}
              />
            </Map>
          </APIProvider>
        ) : (
          /* Fallback Map View when API Key is pending */
          <div className="relative w-full h-full bg-slate-800 text-white p-4 flex flex-col justify-between">
            <iframe
              title="Google Maps Interactive Route Preview"
              src={
                pickup && destination
                  ? `https://maps.google.com/maps?q=${encodeURIComponent(`Zanzibar ${pickup.name} to ${destination.name}`)}&output=embed`
                  : `https://maps.google.com/maps?q=Zanzibar+Airport&output=embed`
              }
              className="absolute inset-0 w-full h-full border-0 opacity-90"
              loading="lazy"
            />
            <div className="relative z-10 bg-white/90 backdrop-blur-md text-slate-900 p-2.5 rounded-xl border border-white/50 text-xs shadow-lg max-w-sm">
              <div className="flex items-center gap-2 font-bold text-[#0B3B8C]">
                <MapPin size={14} className="text-emerald-600" />
                <span>Route Preview Enabled</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {pickup ? pickup.name : 'Select pickup'} → {destination ? destination.name : 'Select destination'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
