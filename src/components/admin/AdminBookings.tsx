import React from 'react';
import { AdminDataTable } from '../AdminDataTable';
import { supabase } from '../../lib/supabase';

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
            header: 'Customer Name',
            key: 'full_name',
            render: (b) => (
              <>
                <div className="font-bold text-white text-sm">{b.full_name}</div>
                <div className="text-[10px] text-slate-400">{b.email || 'No email provided'}</div>
              </>
            ),
          },
          {
            header: 'Destination Package',
            key: 'tour_name',
            render: (b) => (
              <>
                <div className="font-semibold text-[#D4A017]">{b.tour_name}</div>
                <div className="text-[10px] text-slate-400">{b.number_of_guests} travelers</div>
              </>
            ),
          },
          {
            header: 'WhatsApp contact',
            key: 'whatsapp_number',
            render: (b) => (
              <span className="font-mono font-medium text-slate-300">
                {b.whatsapp_number}
              </span>
            ),
          },
          {
            header: 'Travel Date',
            key: 'preferred_date',
            render: (b) => (
              <>
                <div className="font-semibold text-slate-350">{b.preferred_date}</div>
                <div className="text-[10px] truncate max-w-[150px] text-slate-400" title={b.pickup_location}>🚗 Pickup: {b.pickup_location}</div>
              </>
            ),
          },
          {
            header: 'Status',
            key: 'status',
            render: (b) => {
              const statusVal = (b.status || 'pending').toLowerCase();
              let badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
              let dotClass = 'bg-amber-400 animate-pulse';
              if (statusVal === 'confirmed' || statusVal === 'approved' || statusVal === 'paid') {
                badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                dotClass = 'bg-emerald-400';
              } else if (statusVal === 'rejected' || statusVal === 'cancelled' || statusVal === 'canceled') {
                badgeClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                dotClass = 'bg-rose-400';
              } else if (statusVal && statusVal !== 'pending') {
                badgeClass = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                dotClass = 'bg-slate-400';
              }
              return (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                  <span>{b.status}</span>
                </span>
              );
            },
          },
        ]}
        searchKeys={['full_name', 'email', 'whatsapp_number', 'tour_name', 'pickup_location']}
        searchPlaceholder="Search passenger notes, phone, name..."
        statusFilterKey="status"
        statusOptions={[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        csvFilename="Zanzibar_Bookings_Report_2026.csv"
        csvHeaders={['ID', 'Customer Name', 'Email', 'WhatsApp', 'Guests', 'Experience Name', 'Date Requested', 'Pickup', 'Status', 'Submitted At']}
        csvRowMapper={(b) => [
          b.id,
          b.full_name,
          b.email || 'None',
          b.whatsapp_number,
          b.number_of_guests,
          b.tour_name,
          b.preferred_date,
          b.pickup_location,
          b.status,
          b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Unspecified',
        ]}
        onExportSuccess={() => {
          addActivityLog(session?.name || 'Admin', 'exportBookings', 'Exported full bookings ledger to Excel CSV.');
        }}
        onExportPDF={exportBookingsToPDF}
        onBulkUpload={async (importedRows) => {
          const rowsToInsert = importedRows.map(row => ({
            id: row.id || `ZTR-BKG-${Math.floor(1000 + Math.random() * 9000)}`,
            full_name: row.full_name,
            email: row.email || null,
            whatsapp_number: row.whatsapp_number,
            number_of_guests: Number(row.number_of_guests) || 1,
            tour_name: row.tour_name || 'Tours: General Package',
            preferred_date: row.preferred_date || new Date().toISOString().split('T')[0],
            pickup_location: row.pickup_location || 'Hotel lobby pickup',
            status: row.status || 'confirmed',
            message: row.message || 'Imported via Bulk Import Engine',
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
        viewDetailsLabel="View Details & Invoice"
        onEdit={(b) => setEditingBooking({ ...b })}
        onDelete={(b) => setDeletingBooking(b)}
        isEditDisabled={(b) => !canEditOrDeleteBooking(b)}
        isDeleteDisabled={(b) => !canEditOrDeleteBooking(b)}
        emptyMessage="No bookings match your current filter settings."
        pageSize={10}
      />
    </div>
  );
}
