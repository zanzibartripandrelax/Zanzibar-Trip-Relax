import React, { useState } from 'react';
import { Shield, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TourOperationsProps {
  bookingsList: any[];
  setBookingsList: (bookings: any[]) => void;
  session: any;
  addActivityLog: any;
  addBookingAuditTrailItem: (bookingId: string, action: string, description: string) => Promise<void>;
}

export default function TourOperations({
  bookingsList,
  setBookingsList,
  session,
  addActivityLog,
  addBookingAuditTrailItem
}: TourOperationsProps) {
  const [touropsSelectedDate, setTouropsSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dateBookings = bookingsList.filter(b => b.preferred_date === touropsSelectedDate);

  const handleAssign = async (bookingId: string, field: string, value: string) => {
    const updatedBookings = bookingsList.map(bk => bk.id === bookingId ? { 
      ...bk, 
      [field]: value,
      details: { ...(bk.details || {}), [field]: value }
    } : bk);
    setBookingsList(updatedBookings);
    localStorage.setItem('ztr_bookings', JSON.stringify(updatedBookings));

    try {
      const b = bookingsList.find(bk => bk.id === bookingId);
      await supabase.from('bookings').update({
        details: { ...(b.details || b), [field]: value }
      }).eq('id', bookingId);
    } catch (dbErr) { console.warn(dbErr); }

    addActivityLog(session?.name || 'Dispatcher', 'assignStaff', `Assigned ${field} ${value} to booking ${bookingId}.`);
    await addBookingAuditTrailItem(bookingId, `assign${field.charAt(0).toUpperCase() + field.slice(1)}`, `Assigned ${field} "${value}".`);
  };

  const handlePrintManifest = () => {
    if (dateBookings.length === 0) {
      alert('Error: Cannot export empty operations manifest.');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Zanzibar HQ - Daily Dispatch Manifest</title>');
      printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
      printWindow.document.write('<style>body { font-family: monospace; padding: 30px; -webkit-print-color-adjust: exact; }</style></head><body>');
      
      printWindow.document.write(`
        <div class="space-y-6 text-black">
          <div class="border-b-4 border-black pb-4 flex justify-between items-end">
            <div>
              <h1 class="text-2xl font-black uppercase">ZANZIBAR TRIP & RELAX</h1>
              <p class="text-xs">DAILY DEPARTURES & OPERATION DISPATCH MANIFEST</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold">DATE: ${touropsSelectedDate}</p>
              <p class="text-[10px] text-gray-500">GENERATED AT: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          <table class="w-full text-xs text-left border-collapse border border-gray-400">
            <thead>
              <tr class="bg-gray-100 border-b border-gray-400">
                <th class="p-2 border border-gray-400">Ref</th>
                <th class="p-2 border border-gray-400">Traveler Group</th>
                <th class="p-2 border border-gray-400">Package</th>
                <th class="p-2 border border-gray-400">Guests</th>
                <th class="p-2 border border-gray-400">Time</th>
                <th class="p-2 border border-gray-400">Guide</th>
                <th class="p-2 border border-gray-400">Driver</th>
              </tr>
            </thead>
            <tbody>
              ${dateBookings.map(bk => `
                <tr class="border-b border-gray-300">
                  <td class="p-2 border border-gray-300 font-bold">${bk.id}</td>
                  <td class="p-2 border border-gray-300 font-bold">${bk.full_name}</td>
                  <td class="p-2 border border-gray-300">${bk.tour_name}</td>
                  <td class="p-2 border border-gray-300 font-bold text-center">${bk.number_of_guests}</td>
                  <td class="p-2 border border-gray-300 font-bold">${bk.pickup_time || bk.details?.pickup_time || '08:30 AM'}</td>
                  <td class="p-2 border border-gray-300 font-bold">${bk.assigned_guide || bk.details?.assigned_guide || 'TBD'}</td>
                  <td class="p-2 border border-gray-300 font-bold">${bk.assigned_driver || bk.details?.assigned_driver || 'TBD'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-300">
      <div className="bg-[#0A1224] border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Shield className="text-[#D4A017] w-6 h-6" />
            <span>Coordinate Fleet Drivers & Swahili Guides</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Assign logistics crews, specify pickups, and monitor vehicle checklists.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#121B30] border border-white/5 rounded-xl p-2.5">
          <span className="text-xs font-bold text-slate-400">Target Operations Date:</span>
          <input type="date" value={touropsSelectedDate} onChange={e => setTouropsSelectedDate(e.target.value)} className="bg-[#0A1224] border border-white/10 rounded-lg p-1.5 text-white font-mono text-xs outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        <div className="lg:col-span-8 bg-[#0A1224] border border-white/5 p-5 md:p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3 font-bold uppercase tracking-wider">
            <span className="text-white">Scheduled Departures ({dateBookings.length})</span>
          </div>

          {dateBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold">No active departures scheduled for {touropsSelectedDate}.</div>
          ) : (
            <div className="space-y-4">
              {dateBookings.map((b) => (
                <div key={b.id} className="bg-[#121B30]/50 border border-white/5 p-4 rounded-2xl space-y-3 hover:border-[#D4A017]/10 transition-all">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-extrabold text-sm text-white">{b.full_name} <span className="text-[10px] text-slate-500 font-mono ml-2 uppercase">Ref: {b.id}</span></span>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-900 border border-white/5 px-2.5 py-1 rounded-full uppercase">{b.tour_name}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] font-bold">
                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase tracking-wider">Assign Guide</label>
                      <select value={b.assigned_guide || 'Unassigned'} onChange={e => handleAssign(b.id, 'assigned_guide', e.target.value)} className="w-full bg-[#121B30] border border-white/10 rounded-lg p-1.5 text-white">
                        <option value="Unassigned">Unassigned</option>
                        <option value="Captain Ali">Captain Ali</option>
                        <option value="Guide Khamis">Guide Khamis</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase tracking-wider">Assign Driver</label>
                      <select value={b.assigned_driver || 'Unassigned'} onChange={e => handleAssign(b.id, 'assigned_driver', e.target.value)} className="w-full bg-[#121B30] border border-white/10 rounded-lg p-1.5 text-white">
                        <option value="Unassigned">Unassigned</option>
                        <option value="Driver Juma">Driver Juma</option>
                        <option value="Driver Bakari">Driver Bakari</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-[#0A1224] border border-white/5 p-5 rounded-3xl space-y-4 font-bold">
          <h4 className="text-xs text-[#D4A017] uppercase tracking-wider">Operations Summary</h4>
          <div className="space-y-3 text-[11px]">
            <div className="flex justify-between items-center bg-[#121B30] p-3 rounded-xl border border-white/5">
              <span>Total Guests:</span>
              <span className="text-[#D4A017] font-black">{dateBookings.reduce((acc, curr) => acc + Number(curr.number_of_guests || 0), 0)} Out</span>
            </div>
          </div>
          <button onClick={handlePrintManifest} className="w-full bg-[#121B30] hover:bg-[#1a2642] text-white border border-white/10 font-bold py-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-2 transition-all">
            <Printer size={14} className="text-[#D4A017]" />
            <span>Generate Manifest</span>
          </button>
        </div>
      </div>
    </div>
  );
}
