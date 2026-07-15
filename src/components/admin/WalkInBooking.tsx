import React, { useState } from 'react';
import { 
  PlusCircle, CheckCircle, FileText, Image, Printer 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface WalkInBookingProps {
  session: any;
  loadBookings: () => Promise<void>;
  addActivityLog: any;
}

export default function WalkInBooking({ session, loadBookings, addActivityLog }: WalkInBookingProps) {
  const [walkinFormData, setWalkinFormData] = useState({
    full_name: '',
    whatsapp_number: '',
    email: '',
    nationality: 'United Kingdom',
    passport_number: '',
    tour_name: 'Prison Island & Giant Aldabra Tortoises',
    preferred_date: new Date().toISOString().split('T')[0],
    number_of_guests: 2,
    pickup_location: 'Hotel Lobby reception',
    pickup_time: '08:30 AM',
    booking_source: 'Walk-in',
    special_requests: '',
    internal_notes: '',
    payment_mode: 'Cash',
    payment_status: 'Paid in Full',
    total_cost: 90,
    amount_paid: 90,
    attachments: [] as any[]
  });

  const resetForm = () => {
    setWalkinFormData({
      full_name: '',
      whatsapp_number: '',
      email: '',
      nationality: 'United Kingdom',
      passport_number: '',
      tour_name: 'Prison Island & Giant Aldabra Tortoises',
      preferred_date: new Date().toISOString().split('T')[0],
      number_of_guests: 2,
      pickup_location: 'Hotel Lobby reception',
      pickup_time: '08:30 AM',
      booking_source: 'Walk-in',
      special_requests: '',
      internal_notes: '',
      payment_mode: 'Cash',
      payment_status: 'Paid in Full',
      total_cost: 90,
      amount_paid: 90,
      attachments: []
    });
  };

  const handleCommit = async () => {
    if (!walkinFormData.full_name || !walkinFormData.whatsapp_number) {
      alert('Error: Guest Name and WhatsApp phone number are required fields.');
      return;
    }

    const generatedRef = 'ZTR-W-' + Math.floor(100000 + Math.random() * 900000);
    const finalBookingObj = {
      id: generatedRef,
      ...walkinFormData,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      internal_notes: walkinFormData.internal_notes || 'Registered walk-in at HQ.',
    };

    // 1. Save to local storage cache
    const current = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
    const updated = [finalBookingObj, ...current];
    localStorage.setItem('ztr_bookings', JSON.stringify(updated));

    // 2. Insert to Supabase
    try {
      const { error } = await supabase.from('bookings').insert({
        reference_code: generatedRef,
        customer_name: walkinFormData.full_name,
        customer_email: walkinFormData.email || null,
        customer_phone: walkinFormData.whatsapp_number,
        product_name: walkinFormData.tour_name,
        travel_date: walkinFormData.preferred_date,
        guest_count: walkinFormData.number_of_guests,
        pickup_location: walkinFormData.pickup_location,
        status: 'confirmed',
        details: finalBookingObj
      });
      if (error) console.warn('Supabase insert failed:', error);
    } catch (dbErr) {
      console.warn('Supabase DB Exception:', dbErr);
    }

    addActivityLog(session?.name || 'Reception Desk', 'walkinBookingRecorded', `Registered office walk-in booking ${generatedRef} for guest ${walkinFormData.full_name}.`);
    alert(`Asante! Booking ${generatedRef} committed successfully!`);
    await loadBookings();
    resetForm();
  };

  const handlePrint = () => {
    const printContents = document.getElementById('print-voucher-area')?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Booking Voucher</title>');
      printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
      printWindow.document.write('<style>body { font-family: sans-serif; -webkit-print-color-adjust: exact; padding: 40px; }</style></head><body>');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    } else {
      window.print();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-slate-300">
      <div className="lg:col-span-7 bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <PlusCircle className="text-[#D4A017] w-6 h-6" />
            <span>HQ Desk: Register New Walk-In / Phone Booking</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Select packages, record guest identity credentials, process physical payment cards or cash, and log the voucher.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-slate-400 block">Guest Full Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Elena Rostova" value={walkinFormData.full_name} onChange={e => setWalkinFormData(prev => ({ ...prev, full_name: e.target.value }))} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#D4A017]" />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 block">WhatsApp / Phone Number <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. +39 342 12345" value={walkinFormData.whatsapp_number} onChange={e => setWalkinFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none focus:border-[#D4A017]" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-slate-400 block">Select Experience Tour <span className="text-red-500">*</span></label>
            <select
              value={walkinFormData.tour_name}
              onChange={e => {
                const selectedTour = e.target.value;
                let cost = 50;
                if (selectedTour.includes("Safari Blue")) cost = 85;
                else if (selectedTour.includes("Prison Island")) cost = 45;
                const total = cost * walkinFormData.number_of_guests;
                setWalkinFormData(prev => ({ ...prev, tour_name: selectedTour, total_cost: total, amount_paid: prev.payment_status === 'Paid in Full' ? total : total / 2 }));
              }}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-[#D4A017]"
            >
              <option value="Safari Blue Sailing & Snorkeling Excursion">Safari Blue Sailing & Snorkeling Excursion ($85/person)</option>
              <option value="Prison Island & Giant Aldabra Tortoises">Prison Island & Giant Aldabra Tortoises ($45/person)</option>
              <option value="Stone Town Heritage Guided Walk">Stone Town Heritage Guided Walk ($30/person)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 block">Travel Date <span className="text-red-500">*</span></label>
            <input type="date" value={walkinFormData.preferred_date} onChange={e => setWalkinFormData(prev => ({ ...prev, preferred_date: e.target.value }))} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 block">Number of Guests <span className="text-red-500">*</span></label>
            <input type="number" min={1} value={walkinFormData.number_of_guests} onChange={e => setWalkinFormData(prev => ({ ...prev, number_of_guests: parseInt(e.target.value) || 1 }))} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 block">Payment Mode</label>
            <select value={walkinFormData.payment_mode} onChange={e => setWalkinFormData(prev => ({ ...prev, payment_mode: e.target.value }))} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white">
              <option value="Cash">Cash (USD/TSH)</option>
              <option value="Credit Card">Credit Card / POS</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 block">Payment Status</label>
            <select value={walkinFormData.payment_status} onChange={e => setWalkinFormData(prev => ({ ...prev, payment_status: e.target.value }))} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white">
              <option value="Paid in Full">Paid in Full</option>
              <option value="Deposit Only">Deposit Only (Partial)</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/5 font-bold">
          <button onClick={resetForm} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition-all">Reset Form</button>
          <button onClick={handleCommit} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#020C1F] font-black py-3 rounded-xl transition-all flex items-center justify-center gap-1.5">
            <CheckCircle size={16} />
            <span>Commit & Register Voucher</span>
          </button>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4 font-semibold text-slate-800">
        <div id="print-voucher-area" className="bg-white text-[#020C1F] p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-black tracking-tight font-serif uppercase">Zanzibar Trip & Relax</h2>
              <p className="text-[9px] text-slate-500 font-bold leading-none">Stone Town HQ • Mizingani Rd, Zanzibar</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono uppercase">Voucher</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[11px] border-b-2 border-dashed border-slate-200 pb-4">
            <div className="space-y-1">
              <p className="text-slate-400 text-[9px] font-bold uppercase">Traveler</p>
              <p className="font-extrabold text-xs uppercase">{walkinFormData.full_name || 'Anonymous Guest'}</p>
              <p className="text-slate-600">WhatsApp: {walkinFormData.whatsapp_number}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-slate-400 text-[9px] font-bold uppercase">Reference</p>
              <p className="font-bold text-xs font-mono">ZTR-W-2026-TEMP</p>
              <p className="text-slate-600">Date Issued: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="font-black text-xs">{walkinFormData.tour_name}</span>
              <span className="font-mono text-slate-700 font-bold">{walkinFormData.preferred_date}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Pickup: {walkinFormData.pickup_location}</span>
              <span>Guests: {walkinFormData.number_of_guests}</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl space-y-1 text-[11px] border border-slate-100">
            <div className="flex justify-between font-bold text-slate-600">
              <span>Total Cost:</span>
              <span className="font-mono">${walkinFormData.total_cost}.00 USD</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-600">
              <span>Amount Paid:</span>
              <span className="font-mono">${walkinFormData.amount_paid}.00 USD</span>
            </div>
          </div>
        </div>
        <button onClick={handlePrint} className="w-full bg-[#121B30] hover:bg-[#1a2642] text-white border border-white/10 font-bold py-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-2 transition-all">
          <Printer size={14} className="text-[#D4A017]" />
          <span>Print physical receipt & Voucher</span>
        </button>
      </div>
    </div>
  );
}
