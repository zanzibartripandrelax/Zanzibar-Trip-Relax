import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import Breadcrumbs from '../components/Breadcrumbs';
import TransferTracker from '../components/TransferTracker';
import GoogleTransferBooking from '../components/GoogleTransferBooking';

interface TransfersProps {
  navigate: (page: Page, id?: string) => void;
}

export default function Transfers({ navigate }: TransfersProps) {
  const [activeTab, setActiveTab] = useState<'book' | 'track'>('book');

  useEffect(() => {
    document.title = "Book Your Zanzibar Transfer | Zanzibar Trip & Relax";
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#0B3B8C] via-[#082E6E] to-[#041E48] text-white py-8 px-4 md:px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017] bg-[#D4A017]/10 px-3 py-1 rounded-full border border-[#D4A017]/30">
              Official Transfer Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-black font-serif mt-1">
              Zanzibar Airport & Resort Transfers
            </h1>
            <p className="text-xs text-blue-100 max-w-lg mt-0.5">
              Book your private transfer in under 60 seconds with instant confirmation.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/10 p-1 rounded-2xl border border-white/20 backdrop-blur-md shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'book'
                  ? 'bg-[#D4A017] text-[#020C1F] shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Book Transfer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-[#D4A017] text-[#020C1F] shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Manage Booking
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-4">
        <Breadcrumbs items={[{ label: 'Zanzibar Transfers' }]} navigate={navigate} />
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
        {activeTab === 'track' ? (
          <TransferTracker onBackToBooking={() => setActiveTab('book')} />
        ) : (
          <GoogleTransferBooking navigate={navigate} />
        )}
      </main>
    </div>
  );
}
