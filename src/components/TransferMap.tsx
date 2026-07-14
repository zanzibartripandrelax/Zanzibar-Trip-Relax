import { useState, useMemo } from 'react';
import { MapPin, Navigation, Info, Compass, Shield } from 'lucide-react';

interface TransferMapProps {
  pickup: string;
  destination: string;
}

interface LocationPin {
  name: string;
  x: number;
  y: number;
  type: 'airport' | 'ferry' | 'beach' | 'town' | 'safari';
}

const PIN_COORDINATES: Record<string, LocationPin> = {
  'Zanzibar Airport (ZNZ)': { name: 'ZNZ Airport T3', x: 80, y: 220, type: 'airport' },
  'Zanzibar Airport Domestic (ZNZ)': { name: 'ZNZ Airport T2', x: 80, y: 224, type: 'airport' },
  'Ferry Terminal Malindi': { name: 'Ferry Port', x: 75, y: 200, type: 'ferry' },
  'Stone Town Hotels': { name: 'Stone Town', x: 77, y: 205, type: 'town' },
  'Nungwi / Kendwa Resorts': { name: 'Nungwi/Kendwa', x: 110, y: 50, type: 'beach' },
  'Paje / Jambiani / Bwejuu': { name: 'Paje/Jambiani', x: 165, y: 260, type: 'beach' },
  'Matemwe / Kiwengwa': { name: 'Matemwe/Kiwengwa', x: 140, y: 110, type: 'beach' },
  'Kizimkazi Coastal Area': { name: 'Kizimkazi Coastal', x: 135, y: 340, type: 'beach' },
};

export const getRouteStats = (from: string, to: string) => {
  if (!from || !to) return { distance: 0, duration: '0 min' };
  
  const f = from.toLowerCase();
  const t = to.toLowerCase();

  if (f === t) return { distance: 0, duration: '0 min' };

  // airport links
  if (f.includes('airport') && t.includes('nungwi')) return { distance: 64, duration: '1h 15m' };
  if (f.includes('airport') && t.includes('paje')) return { distance: 51, duration: '55m' };
  if (f.includes('airport') && t.includes('matemwe')) return { distance: 48, duration: '50m' };
  if (f.includes('airport') && t.includes('kizimkazi')) return { distance: 60, duration: '1h 05m' };
  if (f.includes('airport') && t.includes('stone')) return { distance: 8, duration: '15m' };
  if (f.includes('airport') && t.includes('ferry')) return { distance: 9, duration: '18m' };

  // reverse airport
  if (t.includes('airport') && f.includes('nungwi')) return { distance: 64, duration: '1h 15m' };
  if (t.includes('airport') && f.includes('paje')) return { distance: 51, duration: '55m' };
  if (t.includes('airport') && f.includes('matemwe')) return { distance: 48, duration: '50m' };
  if (t.includes('airport') && f.includes('kizimkazi')) return { distance: 60, duration: '1h 05m' };
  if (t.includes('airport') && f.includes('stone')) return { distance: 8, duration: '15m' };
  if (t.includes('airport') && f.includes('ferry')) return { distance: 9, duration: '18m' };

  // ferry port links
  if (f.includes('ferry') && t.includes('nungwi')) return { distance: 59, duration: '1h 10m' };
  if (f.includes('ferry') && t.includes('paje')) return { distance: 49, duration: '50m' };
  if (f.includes('ferry') && t.includes('matemwe')) return { distance: 45, duration: '45m' };
  if (f.includes('ferry') && t.includes('kizimkazi')) return { distance: 58, duration: '1h 00m' };
  if (f.includes('ferry') && t.includes('stone')) return { distance: 2, duration: '5m' };

  // reverse ferry port links
  if (t.includes('ferry') && f.includes('nungwi')) return { distance: 59, duration: '1h 10m' };
  if (t.includes('ferry') && f.includes('paje')) return { distance: 49, duration: '50m' };
  if (t.includes('ferry') && f.includes('matemwe')) return { distance: 45, duration: '45m' };
  if (t.includes('ferry') && f.includes('kizimkazi')) return { distance: 58, duration: '1h 00m' };
  if (t.includes('ferry') && f.includes('stone')) return { distance: 2, duration: '5m' };

  // beach to beach
  if (f.includes('nungwi') && t.includes('paje')) return { distance: 88, duration: '1h 45m' };
  if (f.includes('nungwi') && t.includes('matemwe')) return { distance: 30, duration: '40m' };
  if (f.includes('paje') && t.includes('kizimkazi')) return { distance: 40, duration: '45m' };

  // reverse beach to beach
  if (t.includes('nungwi') && f.includes('paje')) return { distance: 88, duration: '1h 45m' };
  if (t.includes('nungwi') && f.includes('matemwe')) return { distance: 30, duration: '40m' };
  if (t.includes('paje') && f.includes('kizimkazi')) return { distance: 40, duration: '45m' };

  // default pair
  return { distance: 32, duration: '45m' };
};

export default function TransferMap({ pickup, destination }: TransferMapProps) {
  const [mapType, setMapType] = useState<'vector' | 'satellite'>('vector');

  const routeStats = useMemo(() => {
    return getRouteStats(pickup, destination);
  }, [pickup, destination]);

  const pickupPin = PIN_COORDINATES[pickup];
  const destPin = PIN_COORDINATES[destination];

  // Map markers to render
  const pins = useMemo(() => {
    const list = Object.values(PIN_COORDINATES);
    return list;
  }, []);

  // Compute Google Maps iframe URL safely
  const satelliteIframeUrl = useMemo(() => {
    if (!pickup || !destination) {
      return "https://maps.google.com/maps?q=Zanzibar%20Airport&t=k&z=10&output=embed";
    }
    const query = encodeURIComponent(`Zanzibar ${pickup} to ${destination}`);
    return `https://maps.google.com/maps?q=${query}&t=h&z=11&output=embed`;
  }, [pickup, destination]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4 overflow-hidden" id="transfer-map-container">
      <div className="flex justify-between items-center pb-2 border-b">
        <div>
          <h4 className="font-bold text-[#0B3B8C] text-sm flex items-center gap-1.5 font-serif">
            <Compass size={16} className="text-[#D4A017] animate-spin-slow" />
            <span>Zanzibar Route Tracking</span>
          </h4>
          <p className="text-[10px] text-slate-400">Calculated dynamic routes & travel times</p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMapType('vector')}
            className={`px-2.5 py-1 rounded-md transition-all ${mapType === 'vector' ? 'bg-[#0B3B8C] text-white shadow-sm' : 'text-slate-600'}`}
          >
            Island Vector
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-md transition-all ${mapType === 'satellite' ? 'bg-[#0B3B8C] text-white shadow-sm' : 'text-slate-600'}`}
          >
            Satellite View
          </button>
        </div>
      </div>

      {pickup && destination && pickup !== destination ? (
        <div className="space-y-4">
          {/* Key Route Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border text-center">
            <div className="border-r">
              <span className="block text-[9px] text-slate-400 font-mono uppercase">Oneway Distance</span>
              <span className="text-sm font-black text-[#D4A017] font-mono">{routeStats.distance} km</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-mono uppercase">Estimated Duration</span>
              <span className="text-sm font-black text-[#0B3B8C] font-mono">{routeStats.duration}</span>
            </div>
          </div>

          <div className="relative h-72 w-full rounded-2xl overflow-hidden border bg-blue-50/20">
            {mapType === 'satellite' ? (
              <iframe
                title="Zanzibar Transfer Satellite Map"
                src={satelliteIframeUrl}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-50">
                {/* Zanzibar Island Vector Outline */}
                <svg
                  viewBox="0 0 240 400"
                  className="w-full h-full p-4"
                  style={{ maxHeight: '100%' }}
                >
                  <defs>
                    <linearGradient id="islandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <dropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.1" />
                    </filter>
                  </defs>

                  {/* Ocean Grid Background */}
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Zanzibar Island Stylized Shape */}
                  <path
                    d="M 120 30 C 130 50, 150 70, 150 90 C 150 110, 190 140, 190 160 C 190 180, 210 210, 200 240 C 190 270, 190 310, 180 340 C 170 370, 150 390, 130 380 C 120 370, 100 350, 95 330 C 90 310, 90 290, 85 270 C 80 250, 70 230, 75 210 C 80 190, 85 170, 80 150 C 75 130, 80 110, 85 90 C 90 70, 110 40, 120 30 Z"
                    fill="url(#islandGrad)"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    filter="url(#shadow)"
                  />

                  {/* Island Compass Deco */}
                  <g transform="translate(40, 60)" opacity="0.4">
                    <circle r="15" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="0" y1="-18" x2="0" y2="18" stroke="#64748b" strokeWidth="1" />
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="#64748b" strokeWidth="1" />
                    <polygon points="0,-18 -4,-4 0,-7 4,-4" fill="#ef4444" />
                    <text x="0" y="-22" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#64748b">N</text>
                  </g>

                  {/* All Base Pins (Lighted subtly) */}
                  {pins.map((pin) => {
                    const isPickup = pin.name === pickupPin?.name;
                    const isDest = pin.name === destPin?.name;
                    return (
                      <g key={pin.name} transform={`translate(${pin.x}, ${pin.y})`}>
                        <circle
                          r={isPickup || isDest ? "5" : "2"}
                          fill={isPickup ? '#ef4444' : (isDest ? '#0B3B8C' : '#94a3b8')}
                          className={isPickup || isDest ? "animate-pulse" : ""}
                        />
                      </g>
                    );
                  })}

                  {/* Glowing Routed Path Link */}
                  {pickupPin && destPin && (
                    <>
                      <path
                        d={`M ${pickupPin.x} ${pickupPin.y} Q ${(pickupPin.x + destPin.x) / 2 + 10} ${(pickupPin.y + destPin.y) / 2 - 15}, ${destPin.x} ${destPin.y}`}
                        fill="none"
                        stroke="#D4A017"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        className="animate-dash"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="40;0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </path>

                      {/* Moving Car Tracker Element */}
                      <circle r="4" fill="#0B3B8C" stroke="#fff" strokeWidth="1">
                        <animateMotion
                          path={`M ${pickupPin.x} ${pickupPin.y} Q ${(pickupPin.x + destPin.x) / 2 + 10} ${(pickupPin.y + destPin.y) / 2 - 15}, ${destPin.x} ${destPin.y}`}
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}

                  {/* Pickup Pin Callout */}
                  {pickupPin && (
                    <g transform={`translate(${pickupPin.x}, ${pickupPin.y})`}>
                      <circle r="9" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                      <path d="M 0 0 L 0 -12" stroke="#ef4444" strokeWidth="1" />
                      <g transform="translate(0, -18)">
                        <rect x="-35" y="-7" width="70" height="14" rx="4" fill="#ef4444" />
                        <text fill="#ffffff" fontSize="7" fontWeight="black" textAnchor="middle" y="2">START</text>
                      </g>
                    </g>
                  )}

                  {/* Destination Pin Callout */}
                  {destPin && (
                    <g transform={`translate(${destPin.x}, ${destPin.y})`}>
                      <circle r="9" fill="rgba(11, 59, 140, 0.2)" className="animate-ping" />
                      <path d="M 0 0 L 0 -12" stroke="#0B3B8C" strokeWidth="1" />
                      <g transform="translate(0, -18)">
                        <rect x="-35" y="-7" width="70" height="14" rx="4" fill="#0B3B8C" />
                        <text fill="#ffffff" fontSize="7" fontWeight="black" textAnchor="middle" y="2">DESTINATION</text>
                      </g>
                    </g>
                  )}
                </svg>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-60 rounded-2xl border border-dashed flex flex-col items-center justify-center p-6 text-center bg-slate-50 space-y-2">
          <MapPin size={28} className="text-slate-300" />
          <p className="text-xs font-bold text-slate-500">Awaiting Route Selections</p>
          <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">Choose your pickup and destination coordinates in the booking form to initialize the interactive route visualizer.</p>
        </div>
      )}

      {/* Safety Note Alert */}
      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-start gap-2.5 text-[10px]">
        <Shield size={14} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-800">Licensed Tourist Passage Way Guarantee</p>
          <p className="text-emerald-700 mt-0.5">All tracked routes use official toll-free, air-conditioned tour passages vetted by the Zanzibar Port Authorities.</p>
        </div>
      </div>
    </div>
  );
}
