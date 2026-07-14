import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Shield, HelpCircle as HelpIcon, Award, MessageSquare } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  { q: 'Is my transfer private or shared?', a: 'By default, we offer exclusively private transfers for your safety, comfort, and direct routing. However, you can toggle our Shared Shuttle option on the booking form if you wish to share the ride with other travelers and pay a reduced rate.' },
  { q: 'What happens if my flight or boat is delayed?', a: 'We actively monitor Zanzibar flight arrivals (ZNZ Airport radar) and ferry docking times in real-time. If your transport is delayed, your driver will automatically adjust their pickup schedule with no additional waiting charges.' },
  { q: 'What is your cancellation policy?', a: 'Enjoy free cancellations with a 100% full refund if requested up to 24 hours prior to your scheduled pickup time. Any cancellations inside of 24 hours can be rescheduled free of charge.' },
  { q: 'Do you provide child safety seats?', a: 'Yes! We support family-safe transfers. You can check the child seat option during checkout to have certified infant or child seats installed in your vehicle for a flat fee of $5 per seat.' },
  { q: 'How will I find my driver at the airport or ferry terminal?', a: 'Your professional driver will be waiting in the arrivals hall holding a personalized signboard with your name, wearing a professional Zanzibar Trip & Relax uniform. We will also send you their WhatsApp details 2 hours before arrival.' },
  { q: 'Can we stop at a supermarket or currency exchange on the way?', a: 'Absolutely! Since this is a private transfer, you can request minor local stops for currency exchange, pharmacy visits, or grocery shopping at no extra charge.' }
];

export default function TransferFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Columns - Policies */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl space-y-4">
          <h4 className="font-extrabold text-[#0B3B8C] text-sm flex items-center gap-2">
            <Shield size={16} className="text-[#D4A017]" />
            <span>Guarantees & Safety Policy</span>
          </h4>
          <div className="space-y-3.5 text-xs leading-relaxed text-slate-600 font-semibold">
            <div className="flex gap-2">
              <span className="text-[#D4A017] shrink-0">✔</span>
              <p><strong>Insured Transport:</strong> All vehicles hold commercial licenses from the Zanzibar Commission for Tourism with premium public liability carriage coverage.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[#D4A017] shrink-0">✔</span>
              <p><strong>ZNZ Flight Tracking:</strong> Live satellite flight tracking ensures we never leave you stranded, regardless of delay length.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[#D4A017] shrink-0">✔</span>
              <p><strong>Professional Crew:</strong> Fully vetted Swahili drivers fluent in English, Swahili, and local geography.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0A1224] p-6 rounded-3xl border border-white/5 text-xs text-white flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-black text-sm text-[#D4A017] uppercase tracking-wider font-mono">24/7 Operations Desk</h4>
            <p className="text-slate-400 font-medium">Need immediate assistance with a live transfer or booking adjustments?</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <a
              href="https://wa.me/255777101202"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-white text-[#0A1224] font-extrabold px-4 py-2.5 rounded-xl transition-all font-mono"
            >
              <MessageSquare size={14} />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Right Columns - FAQ accordions */}
      <div className="lg:col-span-2 space-y-3">
        <div className="pb-2">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wide">
            <HelpIcon size={16} className="text-[#D4A017]" />
            <span>Frequently Asked Questions</span>
          </h3>
        </div>

        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex justify-between items-center p-4 text-left font-extrabold text-slate-700 text-xs hover:text-[#0B3B8C] transition-colors cursor-pointer"
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {isOpen && (
                <div className="px-4 pb-4 text-xs leading-relaxed text-slate-500 font-medium border-t border-slate-50 pt-2 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
