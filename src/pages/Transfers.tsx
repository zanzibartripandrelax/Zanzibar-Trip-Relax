import { useState } from 'react';
import { Page } from '../hooks/useHashRouter';
import { Shield, Clock, Users, MapPin, CheckCircle, Navigation, Info, ArrowRight } from 'lucide-react';

interface TransfersProps {
  navigate: (page: Page, id?: string) => void;
}

const transfersData = [
  { zone: 'Zone 1: Stone Town / Airport Area', destination: 'Stone Town hotels, Airport, Ferry Terminal', priceOneWay: '$15', priceRoundTrip: '$25', duration: '15-20 min' },
  { zone: 'Zone 2: North Coast', destination: 'Nungwi, Kendwa hotels & villas', priceOneWay: '$40', priceRoundTrip: '$75', duration: '60-70 min' },
  { zone: 'Zone 3: East Coast', destination: 'Paje, Jambiani, Bwejuu hotels & villas', priceOneWay: '$40', priceRoundTrip: '$75', duration: '55-65 min' },
  { zone: 'Zone 4: Northeast Coast', destination: 'Matemwe, Kiwengwa, Pongwe, Uroa', priceOneWay: '$35', priceRoundTrip: '$65', duration: '45-55 min' },
  { zone: 'Zone 5: South Coast', destination: 'Kizimkazi area hotels', priceOneWay: '$45', priceRoundTrip: '$85', duration: '60-75 min' },
];

export default function Transfers({ navigate }: TransfersProps) {
  const [selectedZone, setSelectedZone] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4">
          <span className="text-[#D4A017] uppercase tracking-wider font-semibold text-xs mb-2 block">Reliable Private Rides</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Airport & Ferry Transfers
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Hassle-free private transfers with professional local drivers to any resort in Zanzibar
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <Shield className="w-8 h-8 text-[#0B3B8C] mx-auto" />
            <p className="font-bold text-sm text-[#0B3B8C]">Fully Licensed</p>
            <p className="text-gray-400 text-xs">Insured tourist plates & commercial permits</p>
          </div>
          <div className="space-y-1">
            <Clock className="w-8 h-8 text-[#0B3B8C] mx-auto" />
            <p className="font-bold text-sm text-[#0B3B8C]">Meet & Greet</p>
            <p className="text-gray-400 text-xs">Drivers wait with cards even for delayed flights</p>
          </div>
          <div className="space-y-1">
            <Users className="w-8 h-8 text-[#0B3B8C] mx-auto" />
            <p className="font-bold text-sm text-[#0B3B8C]">Seat Options</p>
            <p className="text-gray-400 text-xs">Standard cars, family vans, & VIP transfers</p>
          </div>
          <div className="space-y-1">
            <Navigation className="w-8 h-8 text-[#0B3B8C] mx-auto" />
            <p className="font-bold text-sm text-[#0B3B8C]">Fixed Rates</p>
            <p className="text-gray-400 text-xs">No hidden meters, toll surcharges, or luggage fees</p>
          </div>
        </div>
      </section>

      {/* Transfer Zones */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Zanzibar Destination Zone Rates
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Please review our fixed prices. All rates are for private air-conditioned vehicles (up to 4 passengers with standard suitcase baggage).
            </p>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs uppercase bg-[#0B3B8C] text-white">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Resort Zone</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Destinations Covered</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">Avg. Duration</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">One-Way</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">Round-Trip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 divide-solid">
                  {transfersData.map((t, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{t.zone}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#0B3B8C]">{t.destination}</td>
                      <td className="px-6 py-4 text-center text-xs">{t.duration}</td>
                      <td className="px-6 py-4 text-center font-black text-gray-800">{t.priceOneWay}</td>
                      <td className="px-6 py-4 text-center font-black text-[#D4A017]">{t.priceRoundTrip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transfers Info alert */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
            <Info className="text-[#0B3B8C] shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="font-bold text-[#0B3B8C] text-sm">Need transfer for a larger group?</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                We coordinate 7-seat Toyota Alphards, 12-seat Toyota Hiace vans, and Coaster buses for wedding parties, kite-surfing gear, and multi-family tours. Contact us for group rates.
              </p>
            </div>
          </div>

          {/* Booking prompt */}
          <div className="text-center pt-6">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('booking_prefilled_category', 'transfer');
                localStorage.setItem('booking_prefilled_tour', 'Airport Transfer - One Way');
                navigate('booking', `package=${encodeURIComponent('Airport Transfer - One Way')}`);
              }}
              className="bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Verify & Book Private Transfer</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
