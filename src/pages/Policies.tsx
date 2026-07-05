import { Page } from '../hooks/useHashRouter';
import { Shield, FileText, Scale, CalendarCheck, HelpCircle } from 'lucide-react';

interface PoliciesProps {
  navigate: (page: Page) => void;
}

export default function Policies({ navigate }: PoliciesProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <section className="relative h-[25vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4">
          <FileText className="w-10 h-10 text-[#D4A017] mx-auto mb-2" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Our Rules & Holiday Policies
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-xl mx-auto">
            Payment deposits, cancellation waivers, weather updates, and island safety rules
          </p>
        </div>
      </section>

      {/* Policies items */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border p-8 space-y-10 shadow-sm text-gray-700">
          
          <div className="flex gap-4 items-start">
            <CalendarCheck className="text-[#0B3B8C] shrink-0 mt-1" size={24} />
            <div className="space-y-2">
              <h3 className="font-bold text-[#0B3B8C] text-lg">1. Booking Deposit & Payments</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                To secure flights, dynamic national park permits, or high-end beach villas, we require a small 20% commitment deposit upon booking. The remaining 80% balance is payable upon arrival in Zanzibar in Cash (USD or Tanzanian Shillings) or via standard Credit Cards (subject to a customary processing fee).
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Scale className="text-[#0B3B8C] shrink-0 mt-1" size={24} />
            <div className="space-y-2">
              <h3 className="font-bold text-[#0B3B8C] text-lg">2. Day Tour Cancellations & Refunds</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                For single-day excursions (Safari Blue, Stone Town, Chumbe Snorkeling): Cancellations made up to 48 hours prior to the experience start time receive a 100% full refund. Cancellations between 24-48 hours receive a 50% refund. Cancellations with less than 24 hours notice or guest no-shows are non-refundable.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Shield className="text-[#0B3B8C] shrink-0 mt-1" size={24} />
            <div className="space-y-2">
              <h3 className="font-bold text-[#0B3B8C] text-lg">3. Marine Weather & Force Majeure</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Zanzibar tours are heavily tide and wind dependent. If high-swell sea conditions or unsafe gale winds compel our coast guard or captains to cancel local boats for safety, you will be offered an alternative day, an alternative mainland excursion of equivalent value, or a 100% full refund.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <HelpCircle className="text-[#0B3B8C] shrink-0 mt-1" size={24} />
            <div className="space-y-2">
              <h3 className="font-bold text-[#0B3B8C] text-lg">4. Safe Travel & Respectful Conduct</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Guests are guided by government regulations to respect coral habitats (never anchoring or standing on active polyps) and local communities (covering shoulders/knees when traveling in stone towns). Zanzibar Trip & Relax maintains a zero-tolerance policy for safety breaches or environmental destruction.
              </p>
            </div>
          </div>

          <div className="border-t pt-8 text-center space-y-4">
            <p className="text-xs text-gray-400">If you have specific billing, invoice requirements, or corporate inquiries, do not hesitate to contact us.</p>
            <button
              type="button"
              onClick={() => navigate('contact')}
              className="bg-[#0B3B8C] hover:bg-[#0a3280] text-white text-xs font-semibold px-6 py-2.5 rounded-full"
            >
              Contact Legal & Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
