import React from 'react';
import { AdminDataTable } from '../AdminDataTable';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Mail, Printer, CheckCircle, UserCheck, Car, Clock } from 'lucide-react';
import { showToast } from '../ToastNotification';

interface AdminBookingsProps {
  visibleBookings: any[];
  bookingsLoading: boolean;
  loadBookings: () => Promise<void>;
  setSelectedBooking: (b: any) => void;
  setEditingBooking: (b: any) => void;
  setDeletingBooking: (b: any) => void;
  canEditOrDeleteBooking: (b: any) => boolean;
  exportBookingsToPDF: () => void;
  session: any;
  addActivityLog: any;
}

export default function AdminBookings({
  visibleBookings,
  bookingsLoading,
  loadBookings,
  setSelectedBooking,
  setEditingBooking,
  setDeletingBooking,
  canEditOrDeleteBooking,
  exportBookingsToPDF,
  session,
  addActivityLog
}: AdminBookingsProps) {

  // Direct status update handler
  const handleQuickConfirm = async (b: any) => {
    try {
      const refCode = b.id || b.reference_code;
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Confirmed' })
        .or(`reference_code.eq.${refCode},id.eq.${refCode}`);

      if (error) {
        console.warn('Supabase confirm warning:', error);
      }

      // Update local cache
      const local = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      const updated = local.map((item: any) => {
        if ((item.id || item.reference_code) === refCode) {
          return { ...item, status: 'Confirmed' };
        }
        return item;
      });
      localStorage.setItem('ztr_bookings', JSON.stringify(updated));

      showToast(`Booking ${refCode} Confirmed!`, 'success');
      addActivityLog(session?.name || 'Admin', 'confirmBooking', `Confirmed booking ${refCode}`);
      await loadBookings();
    } catch (err) {
      showToast('Could not update status in DB.', 'error');
    }
  };

  const openWhatsApp = (b: any) => {
    const phone = (b.whatsapp_number || b.customer_phone || b.lead_traveler_phone || '').replace(/[^0-9+]/g, '');
    const name = b.full_name || b.customer_name || 'Guest';
    const tour = b.tour_name || b.product_name || 'Excursion';
    const date = b.preferred_date || b.travel_date || 'Travel Date';
    const pickupTime = b.pickup_time || 'Pending Confirmation';

    const msg = `Hello ${name}! Regarding your booking *${b.id || b.reference_code}* for *${tour}* on ${date}:\n\n- Status: *${b.status || 'Confirmed'}*\n- Pickup Time: *${pickupTime}*\n- Pickup Hotel: *${b.pickup_location || b.pickup_hotel || 'Hotel'}*\n\nThank you for choosing Zanzibar Trip & Relax!`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendEmailAlert = (b: any) => {
    const email = b.email || b.customer_email || '';
    if (!email) {
      showToast('No email address registered for this booking.', 'info');
      return;
    }
    const subject = `Booking Update ${b.id || b.reference_code} - Zanzibar Trip & Relax`;
    const body = `Dear ${b.full_name || b.customer_name},\n\nYour booking for ${b.tour_name || b.product_name} on ${b.preferred_date || b.travel_date} is now updated.\n\nPickup Time: ${b.pickup_time || 'Pending Confirmation'}\nDriver: ${b.driver || b.driver_name || 'Assigned'}\nGuide: ${b.guide || b.guide_name || 'Assigned'}\n\nBest regards,\nZanzibar Trip & Relax Team`;
    
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="space-y-6">
      <AdminDataTable<any>
        data={visibleBookings}
        loading={bookingsLoading}
        dateRangeFilters={[
          { key: 'preferred_date', label: 'Travel Date' },
          { key: 'created_at', label: 'Booking Date' },
        ]}
        columns={[
          {
            header: 'Booking Ref & Guest',
            key: 'full_name',
            render: (b) => {
              const ref = b.id || b.reference_code || 'ZTR-BKG';
              const name = b.full_name || b.customer_name || b.lead_traveler_name || 'Guest Traveler';
              return (
                <div className="space-y-0.5">
                  <span className="font-mono text-[11px] font-black text-[#D4A017] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block w-fit">
                    {ref}
                  </span>
                  <div className="font-bold text-white text-sm">{name}</div>
                  <div className="text-[10px] text-slate-400">{b.email || b.customer_email || 'No email'}</div>
                </div>
              );
            },
          },
          {
            header: 'WhatsApp Contact',
            key: 'whatsapp_number',
            render: (b) => {
              const phone = b.whatsapp_number || b.customer_phone || b.lead_traveler_phone || 'N/A';
              return (
                <div className="space-y-1">
                  <span className="font-mono font-medium text-slate-300 text-xs block">
                    {phone}
                  </span>
                  <button
                    type="button"
                    onClick={() => openWhatsApp(b)}
                    className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 transition-all cursor-pointer"
                  >
                    <MessageCircle size={11} />
                    <span>Send WhatsApp</span>
                  </button>
                </div>
              );
            }
          },
          {
            header: 'Excursion Tour',
            key: 'tour_name',
            render: (b) => (
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-100 text-xs">{b.tour_name || b.product_name}</div>
                <div className="text-[10px] text-slate-400">
                  👥 {b.number_of_guests || b.guest_count || b.adults_count || 1} Travelers
                </div>
              </div>
            ),
          },
          {
            header: 'Travel Date & Hotel',
            key: 'preferred_date',
            render: (b) => (
              <div className="space-y-0.5">
                <div className="font-bold text-amber-400 text-xs">{b.preferred_date || b.travel_date}</div>
                <div className="text-[10px] truncate max-w-[160px] text-slate-400" title={b.pickup_location || b.pickup_hotel}>
                  🏨 {b.pickup_location || b.pickup_hotel || 'Hotel Pickup'}
                </div>
              </div>
            ),
          },
          {
            header: 'Pickup Time (Rule 4)',
            key: 'pickup_time',
            render: (b) => {
              const pTime = b.pickup_time || b.details?.pickup_time;
              if (pTime) {
                return (
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <Clock size={12} /> {pTime}
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                  <Clock size={11} /> Pickup Time Required
                </span>
              );
            }
          },
          {
            header: 'Driver & Guide (Rule 11)',
            key: 'driver',
            render: (b) => {
              const driver = b.driver || b.driver_name || 'Unassigned';
              const guide = b.guide || b.guide_name || 'Unassigned';
              return (
                <div className="space-y-1 text-[10px]">
                  <div className="text-slate-300 flex items-center gap-1">
                    <Car size={11} className="text-blue-400" />
                    <span>Dr: <strong className="text-white">{driver}</strong></span>
                  </div>
                  <div className="text-slate-300 flex items-center gap-1">
                    <UserCheck size={11} className="text-purple-400" />
                    <span>Gd: <strong className="text-white">{guide}</strong></span>
                  </div>
                </div>
              );
            }
          },
          {
            header: 'Status & Pay',
            key: 'status',
            render: (b) => {
              const statusVal = (b.status || 'Pending Confirmation').toLowerCase();
              let badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
              let label = b.status || 'Pending Confirmation';

              if (statusVal === 'confirmed' || statusVal === 'approved') {
                badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                label = 'Confirmed';
              } else if (statusVal === 'rejected' || statusVal === 'cancelled') {
                badgeClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                label = 'Cancelled';
              }

              return (
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                    <span>{label}</span>
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    💵 {b.payment_status || 'Pay on Arrival'} (${b.total_price || 0})
                  </div>
                </div>
              );
            },
          },
          {
            header: 'Actions (Rule 11)',
            key: 'actions',
            render: (b) => (
              <div className="flex flex-wrap items-center gap-1.5 min-w-[180px]">
                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={() => handleQuickConfirm(b)}
                  title="Confirm Reservation"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle size={12} />
                  <span>Confirm</span>
                </button>

                {/* Edit Button / Assign Driver & Guide */}
                <button
                  type="button"
                  onClick={() => setEditingBooking({ ...b })}
                  title="Edit / Assign Driver & Guide"
                  className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Edit / Assign
                </button>

                {/* Email Alert Button */}
                <button
                  type="button"
                  onClick={() => sendEmailAlert(b)}
                  title="Send Email Alert"
                  className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 p-1.5 rounded-lg text-[10px] transition-all cursor-pointer"
                >
                  <Mail size={12} />
                </button>

                {/* Print Voucher / Details Button */}
                <button
                  type="button"
                  onClick={() => setSelectedBooking(b)}
                  title="Print Voucher / Details"
                  className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 p-1.5 rounded-lg text-[10px] transition-all cursor-pointer"
                >
                  <Printer size={12} />
                </button>
              </div>
            )
          }
        ]}
        searchKeys={['id', 'reference_code', 'full_name', 'customer_name', 'email', 'whatsapp_number', 'customer_phone', 'tour_name', 'pickup_location']}
        searchPlaceholder="Search booking ID, passenger name, WhatsApp, hotel..."
        statusFilterKey="status"
        statusOptions={[
          { value: 'all', label: 'All Statuses' },
          { value: 'Pending Confirmation', label: 'Pending Confirmation' },
          { value: 'Confirmed', label: 'Confirmed' },
          { value: 'Cancelled', label: 'Cancelled' },
        ]}
        csvFilename="Zanzibar_Bookings_Report_2026.csv"
        csvHeaders={['ID', 'Customer Name', 'Email', 'WhatsApp', 'Guests', 'Experience Name', 'Date Requested', 'Pickup Location', 'Pickup Time', 'Driver', 'Guide', 'Status']}
        csvRowMapper={(b) => [
          b.id || b.reference_code,
          b.full_name || b.customer_name,
          b.email || b.customer_email || 'None',
          b.whatsapp_number || b.customer_phone,
          b.number_of_guests || b.guest_count,
          b.tour_name || b.product_name,
          b.preferred_date || b.travel_date,
          b.pickup_location || b.pickup_hotel,
          b.pickup_time || 'Pending',
          b.driver || 'Unassigned',
          b.guide || 'Unassigned',
          b.status,
        ]}
        onExportSuccess={() => {
          addActivityLog(session?.name || 'Admin', 'exportBookings', 'Exported full bookings ledger to Excel CSV.');
        }}
        onExportPDF={exportBookingsToPDF}
        onBulkUpload={async (importedRows) => {
          const rowsToInsert = importedRows.map(row => ({
            id: row.id || `ZTR-BKG-${Math.floor(1000 + Math.random() * 9000)}`,
            full_name: row.full_name || row.customer_name,
            email: row.email || null,
            whatsapp_number: row.whatsapp_number || row.customer_phone,
            number_of_guests: Number(row.number_of_guests || row.guest_count) || 1,
            tour_name: row.tour_name || row.product_name || 'Tours: General Package',
            preferred_date: row.preferred_date || row.travel_date || new Date().toISOString().split('T')[0],
            pickup_location: row.pickup_location || 'Hotel lobby pickup',
            status: row.status || 'Pending Confirmation',
            created_at: row.created_at || new Date().toISOString()
          }));

          const currentLocal = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
          const updatedLocal = [...rowsToInsert, ...currentLocal];
          localStorage.setItem('ztr_bookings', JSON.stringify(updatedLocal));

          const supabaseRows = rowsToInsert.map(b => ({
            reference_code: b.id,
            customer_name: b.full_name,
            customer_email: b.email,
            customer_phone: b.whatsapp_number,
            product_name: b.tour_name,
            travel_date: b.preferred_date,
            guest_count: b.number_of_guests,
            pickup_location: b.pickup_location,
            status: b.status,
            details: b
          }));

          try {
            const { error } = await supabase.from('bookings').insert(supabaseRows);
            if (error) console.warn('Supabase bulk insert warning:', error);
          } catch (dbErr) {
            console.warn('Supabase bulk insert exception:', dbErr);
          }

          addActivityLog(session?.name || 'Admin', 'bulkImportBookings', `Successfully imported ${rowsToInsert.length} bookings via CSV bulk upload.`);
          await loadBookings();
        }}
        onViewDetails={(b) => setSelectedBooking(b)}
        viewDetailsLabel="View Details & Print Voucher"
        onEdit={(b) => setEditingBooking({ ...b })}
        onDelete={(b) => setDeletingBooking(b)}
        isEditDisabled={(b) => !canEditOrDeleteBooking(b)}
        isDeleteDisabled={(b) => !canEditOrDeleteBooking(b)}
        emptyMessage="No reservations match your search or filter."
        pageSize={12}
      />
    </div>
  );
}
