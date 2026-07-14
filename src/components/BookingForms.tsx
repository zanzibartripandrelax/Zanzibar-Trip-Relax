import React from 'react';
import { Calendar, User, Phone, Mail, MapPin, Users, HelpCircle, Shield, Award, Luggage, Clock, Plane } from 'lucide-react';
import { HotelOption } from '../lib/cmsStore';

interface FormProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  hotelsList: HotelOption[];
  selectedHotelId: string;
  setSelectedHotelId: (id: string) => void;
  customHotelName: string;
  setCustomHotelName: (name: string) => void;
  notListedHotel: boolean;
  setNotListedHotel: (val: boolean) => void;
  adultsCount: number;
  setAdultsCount: (val: number) => void;
  childrenCount: number;
  setChildrenCount: (val: number) => void;
  arrivalDate: string;
  setArrivalDate: (val: string) => void;
}

// 1. HOLIDAY PACKAGE BOOKING FORM
export function HolidayPackageForm({
  formData,
  setFormData,
  hotelsList,
  selectedHotelId,
  setSelectedHotelId,
  customHotelName,
  setCustomHotelName,
  notListedHotel,
  setNotListedHotel,
  adultsCount,
  setAdultsCount,
  childrenCount,
  setChildrenCount,
  arrivalDate,
  setArrivalDate,
}: FormProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6" id="holiday-package-form-container">
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-[#D4A017]" />
          <span>1. Preferred Travel Dates & Room Preference</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Arrival Date *</label>
            <input
              type="date"
              required
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Departure Date *</label>
            <input
              type="date"
              required
              name="departureDate"
              value={formData.departureDate || ''}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Room Preference *</label>
            <select
              name="roomPreference"
              value={formData.roomPreference || 'Double Room'}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            >
              <option value="Single Room">Single Room (1 King Bed - 1 Traveler)</option>
              <option value="Double Room">Double Room (1 King Bed - 2 Travelers)</option>
              <option value="Twin Room">Twin Room (2 Single Beds - 2 Travelers)</option>
              <option value="Family Suite">Family Suite (2 Queen Beds - 3+ Travelers)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Users size={14} className="text-[#D4A017]" />
          <span>2. Number of Travelers</span>
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Adults (12+ yrs)</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                -
              </button>
              <span className="flex-grow text-center text-xs font-bold text-slate-800">{adultsCount}</span>
              <button
                type="button"
                onClick={() => setAdultsCount(adultsCount + 1)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Children (2-11 yrs)</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                -
              </button>
              <span className="flex-grow text-center text-xs font-bold text-slate-800">{childrenCount}</span>
              <button
                type="button"
                onClick={() => setChildrenCount(childrenCount + 1)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-[#D4A017]" />
          <span>3. Private Pickup Location</span>
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="notListed"
              checked={notListedHotel}
              onChange={(e) => setNotListedHotel(e.target.checked)}
              className="rounded text-[#0B3B8C] focus:ring-[#0B3B8C]"
            />
            <label htmlFor="notListed" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
              My hotel is not listed, or pickup from Zanzibar Airport (ZNZ)
            </label>
          </div>

          {notListedHotel ? (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Specify Airport Terminal or Hotel Name *</label>
              <input
                type="text"
                required
                name="customPickup"
                placeholder="e.g. Zanzibar Airport Arrival Terminal / Zuri Zanzibar Resort"
                value={customHotelName}
                onChange={(e) => setCustomHotelName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Select Zanzibar Resort / Hotel *</label>
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              >
                <option value="">-- Choose Hotel for complimentary or calculated pickup --</option>
                {hotelsList.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <User size={14} className="text-[#D4A017]" />
          <span>4. Lead Traveler Details & Special Requests</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">First Name *</label>
            <input
              type="text"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleTextChange}
              placeholder="First name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Last Name *</label>
            <input
              type="text"
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleTextChange}
              placeholder="Last name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Nationality *</label>
            <input
              type="text"
              required
              name="nationality"
              value={formData.nationality || ''}
              onChange={handleTextChange}
              placeholder="e.g. British, American"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail size={12} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleTextChange}
                placeholder="email@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">WhatsApp Number *</label>
            <div className="relative">
              <Phone size={12} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                required
                name="whatsapp"
                value={formData.whatsapp || ''}
                onChange={handleTextChange}
                placeholder="e.g. +44 7911 123456"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Phone Number (Alternative)</label>
            <div className="relative">
              <Phone size={12} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleTextChange}
                placeholder="e.g. +44 20 7946 0958"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-slate-100/50 p-4 rounded-xl border border-slate-200/50">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Arrival Flight Details (Optional)</label>
            <input
              type="text"
              name="arrivalFlight"
              value={formData.arrivalFlight || ''}
              onChange={handleTextChange}
              placeholder="e.g. QR1487 @ 14:20"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Departure Flight Details (Optional)</label>
            <input
              type="text"
              name="departureFlight"
              value={formData.departureFlight || ''}
              onChange={handleTextChange}
              placeholder="e.g. ET815 @ 16:45"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Special Requests / Diet / Honeymoon Setup</label>
          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleTextChange}
            placeholder="Let us know if this is a honeymoon getaway, or if you have specific dietary preferences/medical notes..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// 2. DAY TOUR BOOKING FORM
export function DayTourForm({
  formData,
  setFormData,
  hotelsList,
  selectedHotelId,
  setSelectedHotelId,
  customHotelName,
  setCustomHotelName,
  notListedHotel,
  setNotListedHotel,
  adultsCount,
  setAdultsCount,
  childrenCount,
  setChildrenCount,
  arrivalDate,
  setArrivalDate,
}: FormProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6" id="day-tour-form-container">
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-[#D4A017]" />
          <span>1. Preferred Excursion Date & Travelers</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Tour Date *</label>
            <input
              type="date"
              required
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Adults (12+ yrs)</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                className="px-3 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                -
              </button>
              <span className="flex-grow text-center text-xs font-bold text-slate-800">{adultsCount}</span>
              <button
                type="button"
                onClick={() => setAdultsCount(adultsCount + 1)}
                className="px-3 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Children (2-11 yrs)</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                className="px-3 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                -
              </button>
              <span className="flex-grow text-center text-xs font-bold text-slate-800">{childrenCount}</span>
              <button
                type="button"
                onClick={() => setChildrenCount(childrenCount + 1)}
                className="px-3 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-[#D4A017]" />
          <span>2. Resort Pickup details</span>
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="notListedTour"
              checked={notListedHotel}
              onChange={(e) => setNotListedHotel(e.target.checked)}
              className="rounded text-[#0B3B8C] focus:ring-[#0B3B8C]"
            />
            <label htmlFor="notListedTour" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
              My hotel is not listed (Specify manually below)
            </label>
          </div>

          {notListedHotel ? (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Pickup Hotel / Location Name *</label>
              <input
                type="text"
                required
                name="customPickup"
                placeholder="e.g. Riu Jambo Resort Beach Entrance"
                value={customHotelName}
                onChange={(e) => setCustomHotelName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Select Pickup Resort *</label>
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              >
                <option value="">-- Choose Resort for pickup --</option>
                {hotelsList.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <User size={14} className="text-[#D4A017]" />
          <span>3. Traveler Info & Special Requests</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">First Name *</label>
            <input
              type="text"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleTextChange}
              placeholder="First name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Last Name *</label>
            <input
              type="text"
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleTextChange}
              placeholder="Last name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Email *</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleTextChange}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">WhatsApp / Phone *</label>
            <input
              type="tel"
              required
              name="phone"
              value={formData.phone}
              onChange={handleTextChange}
              placeholder="e.g. +44 7911 123456"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Special Requests (Diet, gear sizes, etc.)</label>
          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleTextChange}
            placeholder="Specify any dietary restrictions, shoe/fin sizes (for snorkeling), or general physical considerations..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// 3. AIRPORT TRANSFER BOOKING FORM
export function AirportTransferForm({
  formData,
  setFormData,
  hotelsList,
  selectedHotelId,
  setSelectedHotelId,
  customHotelName,
  setCustomHotelName,
  notListedHotel,
  setNotListedHotel,
  adultsCount,
  setAdultsCount,
  childrenCount,
  setChildrenCount,
  arrivalDate,
  setArrivalDate,
}: FormProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6" id="airport-transfer-form-container">
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Plane size={14} className="text-[#D4A017]" />
          <span>1. Transfer Type & Flight / Ferry Details</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Direction *</label>
            <select
              name="transferDirection"
              value={formData.transferDirection || 'arrival'}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            >
              <option value="arrival">Arrival (Airport/Ferry Terminal ➔ Hotel)</option>
              <option value="departure">Departure (Hotel ➔ Airport/Ferry Terminal)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Hub / Terminal *</label>
            <select
              name="transferTerminal"
              value={formData.transferTerminal || 'ZNZ Airport'}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            >
              <option value="ZNZ Airport">Abeid Amani Karume Int Airport (ZNZ) Terminal 3</option>
              <option value="ZNZ Airport Dom">Zanzibar Airport (ZNZ) Domestic Terminal 2</option>
              <option value="ZNZ Ferry">Zanzibar Port (Malindi Ferry Terminal)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Flight / Ferry Number *</label>
            <input
              type="text"
              required
              name="flightNo"
              value={formData.flightNo || ''}
              onChange={handleTextChange}
              placeholder="e.g. QR1499 or Azam Ferry"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Arrival/Departure Time *</label>
            <div className="relative">
              <Clock size={12} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                name="flightTime"
                value={formData.flightTime || ''}
                onChange={handleTextChange}
                placeholder="e.g. 14:30 (EAT)"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Transfer Date *</label>
            <input
              type="date"
              required
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-[#D4A017]" />
          <span>2. Resort or Hotel Location</span>
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="notListedTransfer"
              checked={notListedHotel}
              onChange={(e) => setNotListedHotel(e.target.checked)}
              className="rounded text-[#0B3B8C] focus:ring-[#0B3B8C]"
            />
            <label htmlFor="notListedTransfer" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
              My resort is not listed (Specify manually below)
            </label>
          </div>

          {notListedHotel ? (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Hotel Name & Village *</label>
              <input
                type="text"
                required
                name="customPickup"
                placeholder="e.g. Luxury Eco Villa, Jambiani"
                value={customHotelName}
                onChange={(e) => setCustomHotelName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Select Hotel / Destination Resort *</label>
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
              >
                <option value="">-- Choose destination hotel --</option>
                {hotelsList.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Luggage size={14} className="text-[#D4A017]" />
          <span>3. Capacity, Luggage & Contacts</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Number of Passengers (Adults/Kids) *</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                -
              </button>
              <span className="flex-grow text-center text-xs font-bold text-slate-800">{adultsCount} Pax</span>
              <button
                type="button"
                onClick={() => setAdultsCount(adultsCount + 1)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Number of Large Suitcases / Bags *</label>
            <input
              type="number"
              required
              min="0"
              name="bagsCount"
              value={formData.bagsCount || '2'}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">First Name *</label>
            <input
              type="text"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleTextChange}
              placeholder="First name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Last Name *</label>
            <input
              type="text"
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleTextChange}
              placeholder="Last name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleTextChange}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">WhatsApp / Phone *</label>
            <input
              type="tel"
              required
              name="phone"
              value={formData.phone}
              onChange={handleTextChange}
              placeholder="e.g. +44 7911 123456"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. TANZANIA SAFARI BOOKING FORM
export function SafariForm({
  formData,
  setFormData,
  adultsCount,
  setAdultsCount,
  arrivalDate,
  setArrivalDate,
}: FormProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6" id="safari-form-container">
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-[#D4A017]" />
          <span>1. Preferred Safari Date & Travelers count</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Preferred Start Date *</label>
            <input
              type="date"
              required
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Number of Travellers *</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                -
              </button>
              <span className="flex-grow text-center text-xs font-bold text-slate-800">{adultsCount} Climbers / Guests</span>
              <button
                type="button"
                onClick={() => setAdultsCount(adultsCount + 1)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Shield size={14} className="text-[#D4A017]" />
          <span>2. Accommodation Standard & Logistics</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Lodging Standard *</label>
            <select
              name="safariAccommodation"
              value={formData.safariAccommodation || 'mid-range'}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-semibold"
            >
              <option value="luxury">Luxury Tier (5-Star Private Game Lodges)</option>
              <option value="mid-range">Mid-range Comfort (Luxury Canvas Glamping)</option>
              <option value="budget">Budget Level (Adventure Tented Campgrounds)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Pickup Location *</label>
            <input
              type="text"
              required
              name="pickupLocation"
              placeholder="e.g. Arusha Airport or Hotel in Stone Town"
              value={formData.pickupLocation || ''}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <User size={14} className="text-[#D4A017]" />
          <span>3. Contacts & Special Requests</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">First Name *</label>
            <input
              type="text"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleTextChange}
              placeholder="First name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Last Name *</label>
            <input
              type="text"
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleTextChange}
              placeholder="Last name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Email *</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleTextChange}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">WhatsApp / Phone *</label>
            <input
              type="tel"
              required
              name="phone"
              value={formData.phone}
              onChange={handleTextChange}
              placeholder="e.g. +44 7911 123456"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Special Dietary & Health notes</label>
          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleTextChange}
            placeholder="Please specify any food allergies, dietary requirements, vegetarian/vegan preferences, or minor mobility details..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// 5. KILIMANJARO TREK BOOKING FORM
export function KilimanjaroForm({
  formData,
  setFormData,
  adultsCount,
  setAdultsCount,
  arrivalDate,
  setArrivalDate,
}: FormProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6" id="kilimanjaro-form-container">
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-[#D4A017]" />
          <span>1. Expedition Start Date & Climbers count</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Trek Start Date *</label>
            <input
              type="date"
              required
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Number of Climbers *</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                -
              </button>
              <span className="flex-grow text-center text-xs font-bold text-slate-800">{adultsCount} Climbers</span>
              <button
                type="button"
                onClick={() => setAdultsCount(adultsCount + 1)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-all text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <Award size={14} className="text-[#D4A017]" />
          <span>2. Lodging Logistics & Airport Pick-Up</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Accommodation Before/After Trek *</label>
            <input
              type="text"
              required
              name="accommodationBeforeAfter"
              placeholder="e.g. Parkview Hotel Moshi, or Yes please arrange hotel"
              value={formData.accommodationBeforeAfter || 'Moshi Mountain Lodge (Pre-arranged)'}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Airport Pickup from JRO Airport? *</label>
            <select
              name="airportPickup"
              value={formData.airportPickup || 'Yes'}
              onChange={handleTextChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 font-medium"
            >
              <option value="Yes">Yes (Complimentary Airport Pickup JRO ➔ Moshi Hotel)</option>
              <option value="No">No (I will make my own way to Moshi)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <h4 className="text-xs font-black uppercase text-[#0B3B8C] tracking-wider mb-4 flex items-center gap-2">
          <User size={14} className="text-[#D4A017]" />
          <span>3. Contacts & Emergency details</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">First Name *</label>
            <input
              type="text"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleTextChange}
              placeholder="First name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Last Name *</label>
            <input
              type="text"
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleTextChange}
              placeholder="Last name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Email *</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleTextChange}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">WhatsApp / Phone *</label>
            <input
              type="tel"
              required
              name="phone"
              value={formData.phone}
              onChange={handleTextChange}
              placeholder="e.g. +44 7911 123456"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Medical, Gear requests or Altitude experience notes</label>
          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleTextChange}
            placeholder="Let us know if you need to rent climbing gear (down jacket, sleeping bag, trekking poles), or have any relevant chronic medical notes..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
