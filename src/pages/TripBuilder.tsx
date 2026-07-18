import { useState, useMemo } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion } from 'motion/react';
import DatePicker from '../components/DatePicker';
import { Calendar, Users, MapPin, Check, ChevronRight, ChevronLeft, Star, Plus, Minus, Plane, Compass, User, Phone, Mail, Globe, MessageCircle } from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';
import { supabase } from '../lib/supabase';
import { useAnalytics } from '../context/AnalyticsContext';
import { dispatchAutomatedEmail } from '../lib/emailService';
import { addActivityLog } from '../lib/cmsStore';

interface TripBuilderProps {
  navigate: (page: Page) => void;
}

const TOTAL_STEPS = 11;

const destinations = [
  'Zanzibar', 'Tanzania Mainland', 'Zanzibar + Tanzania Safari',
  'Mount Kilimanjaro', 'Serengeti', 'Ngorongoro',
  'Tarangire', 'Nyerere National Park', 'Mikumi National Park',
  'Arusha', 'Custom Destination',
];

const experienceTypes = [
  'Honeymoon', 'Anniversary', 'Family Holiday', 'Adventure', 'Luxury Escape',
  'Safari Experience', 'Beach Holiday', 'Snorkeling & Diving', 'Cultural Experience',
  'Romantic Getaway', 'Group Travel', 'Solo Traveler', 'Wildlife & Nature',
  'Zanzibar & Safari Combo', 'Custom Trip',
];

const budgetRanges = [
  { id: 'budget', label: '$500 – $1,500', desc: 'Budget-friendly' },
  { id: 'mid', label: '$1,500 – $3,000', desc: 'Mid-range' },
  { id: 'premium', label: '$3,000 – $6,000', desc: 'Premium' },
  { id: 'luxury', label: '$6,000+', desc: 'Luxury & bespoke' },
];

const tourOptions = [
  { id: 'safari-blue', name: 'Safari Blue', price: 95, duration: 'Full Day' },
  { id: 'mnemba', name: 'Mnemba Island Snorkeling', price: 75, duration: 'Full Day' },
  { id: 'stone-town', name: 'Stone Town Tour', price: 45, duration: 'Half Day' },
  { id: 'prison-island', name: 'Prison Island & Sandbank', price: 65, duration: 'Half Day' },
  { id: 'spice-farm', name: 'Spice Farm Tour', price: 40, duration: 'Half Day' },
  { id: 'jozani-forest', name: 'Jozani Forest', price: 45, duration: 'Half Day' },
  { id: 'dolphin-tour', name: 'Dolphin Tour', price: 55, duration: 'Half Day' },
  { id: 'sunset-cruise', name: 'Sunset Dhow Cruise', price: 50, duration: 'Evening' },
  { id: 'quad-bike', name: 'Quad Bike Adventure', price: 85, duration: 'Half Day' },
];

const safariOptions = [
  { id: 'serengeti-3', name: '3-Day Serengeti Safari', price: 1899, duration: '3 Days' },
  { id: 'ngorongoro', name: 'Ngorongoro Crater', price: 1299, duration: '2 Days' },
  { id: 'tarangire', name: 'Tarangire National Park', price: 799, duration: '2 Days' },
  { id: 'northern-circuit', name: 'Northern Circuit (7 Days)', price: 4599, duration: '7 Days' },
];

const transferOptions = [
  { id: 'airport-stone-town', name: 'Airport to/from Stone Town', price: 25 },
  { id: 'airport-nungwi', name: 'Airport to/from Nungwi/Kendwa', price: 65 },
  { id: 'airport-paje', name: 'Airport to/from Paje/Jambiani', price: 55 },
  { id: 'private-luxury', name: 'Private Luxury Transfer', price: 120 },
];

const hotelCategories = [
  { id: 'budget', name: 'Budget', pricePerNight: 80, desc: 'Clean & comfortable guesthouses' },
  { id: 'comfort', name: 'Comfort', pricePerNight: 140, desc: 'Mid-range hotels & resorts' },
  { id: 'premium', name: 'Premium', pricePerNight: 250, desc: 'Upscale beach resorts' },
  { id: 'luxury', name: 'Luxury', pricePerNight: 450, desc: '5-star & boutique lodges' },
];

const countries = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Netherlands', 'Switzerland',
  'Australia', 'Canada', 'Italy', 'Spain', 'Japan', 'China', 'India', 'South Africa',
  'Kenya', 'Uganda', 'Tanzania', 'Other',
];

export default function TripBuilder({ navigate }: TripBuilderProps) {
  const { trackInquirySend, trackWhatsAppClick } = useAnalytics();
  const [step, setStep] = useState(1);

  // Contact info
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');

  // Trip details
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budget, setBudget] = useState('');
  const [hotelCategory, setHotelCategory] = useState('comfort');
  const [selectedTours, setSelectedTours] = useState<string[]>([]);
  const [selectedSafaris, setSelectedSafaris] = useState<string[]>([]);
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const nights = useMemo(() => {
    if (!arrivalDate || !departureDate) return 0;
    const diff = Math.ceil((new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [arrivalDate, departureDate]);

  const hotel = hotelCategories.find(h => h.id === hotelCategory);

  const calculateTotal = () => {
    let total = 0;
    if (hotel && nights > 0) total += hotel.pricePerNight * nights;
    selectedTours.forEach(id => { const t = tourOptions.find(x => x.id === id); if (t) total += t.price * adults; });
    selectedSafaris.forEach(id => { const s = safariOptions.find(x => x.id === id); if (s) total += s.price * adults; });
    selectedTransfers.forEach(id => { const t = transferOptions.find(x => x.id === id); if (t) total += t.price; });
    return total;
  };

  const toggleItem = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter(i => i !== id) : [...list, id]);
  };

  const generateReference = () => `ZTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

  const handleSubmit = async () => {
    if (!fullName.trim() || !whatsapp.trim() || !email.trim()) return;
    setSubmitting(true);
    const ref = generateReference();
    setBookingRef(ref);

    await supabase.from('search_inquiries').insert([{
      full_name: fullName.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      destination: selectedDestination || null,
      experience_type: selectedExperience || null,
      arrival_date: arrivalDate || null,
      departure_date: departureDate || null,
      adults,
      children,
      budget_range: budget,
      special_requests: JSON.stringify({
        reference: ref,
        country,
        nights,
        hotelCategory,
        selectedTours,
        selectedSafaris,
        selectedTransfers,
        specialRequests,
        estimatedTotal: calculateTotal(),
      }),
    }]);

    // Track Custom Itinerary Request in GA4
    trackInquirySend('trip_builder', fullName.trim(), {
      destination: selectedDestination || 'General Zanzibar',
      experience_type: selectedExperience || 'None',
      budget: budget || 'Standard',
      adults,
      children
    });

    // Send automated itinerary email confirmation
    try {
      const budgetLabel = budgetRanges.find(b => b.id === budget)?.label || 'Standard / Mid-Range';
      dispatchAutomatedEmail('custom_inquiry', email.trim(), fullName.trim(), {
        reference: ref,
        destination: selectedDestination || 'Zanzibar Excursion Archipelago',
        experience: selectedExperience || 'Not Specified',
        arrival: arrivalDate || 'Flexible',
        departure: departureDate || 'Flexible',
        nights: nights || 'Flexible',
        adults,
        children,
        budget: budgetLabel,
        hotelCategory,
        specialRequests,
        estimatedTotal: calculateTotal().toLocaleString(),
        whatsapp: whatsapp.trim()
      });
    } catch (e) {
      console.error('Failed to dispatch automated inquiry confirmation email', e);
    }

    // Persist simulated WhatsApp log for customer
    try {
      const waLogs = JSON.parse(localStorage.getItem('ztr_whatsapp_logs') || '[]');
      waLogs.unshift({
        id: `wa-inquiry-${Date.now()}`,
        phone: whatsapp.trim(),
        message: `Jambo ${fullName.trim()}! We received your custom Zanzibar itinerary request (Ref: ${ref}). A travel specialist will contact you shortly to refine your plan. Karibu!`,
        status: 'delivered',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
      localStorage.setItem('ztr_whatsapp_logs', JSON.stringify(waLogs.slice(0, 200)));
    } catch (e) {
      console.error('Failed to log simulated WhatsApp inquiry dispatch', e);
    }

    // Add activity log to CMS
    try {
      addActivityLog(
        fullName.trim(),
        'Guest',
        `Submitted custom itinerary builder inquiry (Ref: ${ref}, Destination: ${selectedDestination || 'Zanzibar'})`
      );
    } catch (e) {
      console.error('Failed to register CMS activity log for custom trip inquiry', e);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const canProceed = () => {
    if (step === 1) return fullName.trim().length > 1 && whatsapp.trim().length > 5 && email.includes('@');
    return true;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B8C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Trip Request Submitted!
          </h1>
          <p className="text-gray-500 mb-2">Hello {fullName}, your reference number is:</p>
          <div className="bg-[#0B3B8C] text-white text-2xl font-bold py-4 rounded-xl mb-4">
            {bookingRef}
          </div>
          <p className="text-gray-400 text-sm mb-6">
            We'll contact you within 24 hours on WhatsApp or email to finalize your custom trip.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/255629506063?text=${encodeURIComponent(`Hello! I'm ${fullName}. My trip request reference is ${bookingRef}. I'd love to discuss my custom trip to ${selectedDestination || 'Zanzibar'}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('Trip Builder Success Screen', bookingRef)}
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1ebd5a] transition-colors"
            >
              <MessageCircle size={16} fill="white" />
              Continue on WhatsApp
            </a>
            <button onClick={() => navigate('home')} className="px-6 py-3 rounded-full border border-gray-300 text-gray-600 hover:border-[#0B3B8C] hover:text-[#0B3B8C] transition-all">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
        <div className="absolute inset-0 bg-[#0B1E3D]/70" />
        <div className="relative z-10 text-center px-4 pt-20">
          <Compass className="w-12 h-12 mx-auto mb-4 text-[#D4A017]" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Build Your dream Trip
          </h1>
          <p className="text-white/80 text-lg">Personalized Zanzibar & Tanzania adventures</p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-[#0B1E3D] py-5 px-4 sticky top-[68px] lg:top-[80px] z-40 border-b border-white/10 shadow-lg select-none">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator Track */}
          <div className="relative flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
            {/* Background progress connector bar */}
            <div className="absolute top-[14px] left-[15px] right-[15px] h-0.5 bg-white/15 rounded-full z-0 pointer-events-none min-w-[320px]">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#D4A017] to-amber-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="flex items-center justify-between w-full relative z-10 min-w-[320px]">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => {
                const isActive = step === s;
                const isCompleted = step > s;
                
                return (
                  <div key={s} className="flex flex-col items-center shrink-0 group">
                    <motion.button
                      type="button"
                      initial={false}
                      animate={{
                        scale: isActive ? 1.2 : 1,
                        backgroundColor: isActive ? '#FFFFFF' : isCompleted ? '#D4A017' : 'rgba(255, 255, 255, 0.1)',
                        color: isActive ? '#0B1E3D' : '#FFFFFF',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      onClick={() => {
                        if (s < step) {
                          setStep(s);
                        }
                      }}
                      disabled={s >= step}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm transition-all relative ${
                        s < step ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                      }`}
                    >
                      {isCompleted ? <Check size={13} className="stroke-[3]" /> : s}
                      
                      {/* Active glow pulse */}
                      {isActive && (
                        <span className="absolute inset-[-3px] rounded-full border-2 border-white/35 animate-ping pointer-events-none" />
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-xs text-white/50">
            <div>
              <span className="font-mono text-[10px] text-[#D4A017] bg-[#D4A017]/10 border border-[#D4A017]/25 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Step {step} of {TOTAL_STEPS}
              </span>
            </div>
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="text-[#D4A017]">•</span>
              {(() => {
                const STEP_LABELS = [
                  'Your Contact Details',
                  'Select Your Destinations',
                  'Choose Experience Vibe',
                  'Trip Schedule & Nights',
                  'Number of Travelers',
                  'Accommodation Class',
                  'Select Excursions',
                  'Select Mainland Safaris',
                  'Select Local Transfers',
                  'Special Custom Requests',
                  'Review Customized Quotation'
                ];
                return STEP_LABELS[step - 1] || 'Trip Builder';
              })()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <section className="max-w-2xl mx-auto py-12 px-4">

        {/* Step 1: Contact Info */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <User className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>Your Contact Details</h2>
              <p className="text-gray-500 mt-2">So we can send you a personalized quote</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smith"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0B3B8C] focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+1 234 567 8900"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0B3B8C] focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0B3B8C] focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0B3B8C] focus:outline-none text-sm bg-white appearance-none">
                    <option value="">Select your country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Destination */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>Where would you like to go?</h2>
              <p className="text-gray-500 mt-2">Select your dream destination</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {destinations.map(dest => (
                <button key={dest} onClick={() => setSelectedDestination(dest)}
                  className={`p-4 rounded-xl border-2 text-left transition-all text-sm font-medium flex items-center gap-2 ${selectedDestination === dest ? 'border-[#D4A017] bg-[#D4A017]/5 text-[#0B3B8C]' : 'border-gray-200 hover:border-[#0B3B8C] text-gray-700'}`}>
                  <MapPin size={14} className={selectedDestination === dest ? 'text-[#D4A017]' : 'text-gray-400'} />
                  {dest}
                  {selectedDestination === dest && <Check size={14} className="ml-auto text-[#D4A017]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Experience Type */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Compass className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>What type of experience?</h2>
              <p className="text-gray-500 mt-2">Choose what best describes your ideal trip</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {experienceTypes.map(exp => (
                <button key={exp} onClick={() => setSelectedExperience(exp)}
                  className={`p-4 rounded-xl border-2 text-left transition-all text-sm font-medium flex items-center gap-2 ${selectedExperience === exp ? 'border-[#D4A017] bg-[#D4A017]/5 text-[#0B3B8C]' : 'border-gray-200 hover:border-[#0B3B8C] text-gray-700'}`}>
                  <Star size={14} className={selectedExperience === exp ? 'text-[#D4A017]' : 'text-gray-400'} />
                  {exp}
                  {selectedExperience === exp && <Check size={14} className="ml-auto text-[#D4A017]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Arrival Date */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>When do you arrive?</h2>
              <p className="text-gray-500 mt-2">Select your arrival date in Zanzibar / Tanzania</p>
            </div>
            <div className="max-w-md mx-auto">
              <DatePicker
                selectedDate={arrivalDate}
                onChange={setArrivalDate}
                minDate={new Date().toISOString().split('T')[0]}
                placeholder="Choose Arrival Date"
              />
            </div>
          </div>
        )}

        {/* Step 5: Departure Date */}
        {step === 5 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Plane className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>When do you depart?</h2>
              <p className="text-gray-500 mt-2">Select your departure date</p>
              {nights > 0 && (
                <div className="inline-flex items-center gap-2 bg-[#D4A017]/10 text-[#D4A017] px-4 py-2 rounded-full mt-4">
                  <Calendar size={16} />
                  <span className="font-semibold">{nights} nights</span>
                </div>
              )}
            </div>
            <div className="max-w-md mx-auto">
              <DatePicker
                selectedDate={departureDate}
                onChange={setDepartureDate}
                minDate={arrivalDate || new Date().toISOString().split('T')[0]}
                placeholder="Choose Departure Date"
              />
            </div>
          </div>
        )}

        {/* Step 6: Adults */}
        {step === 6 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>How many adults?</h2>
              <p className="text-gray-500 mt-2">Ages 13 and above</p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Minus size={24} /></button>
              <span className="text-5xl font-bold text-[#0B3B8C]">{adults}</span>
              <button type="button" onClick={() => setAdults(Math.min(20, adults + 1))} className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Plus size={24} /></button>
            </div>
          </div>
        )}

        {/* Step 7: Children */}
        {step === 7 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>Traveling with children?</h2>
              <p className="text-gray-500 mt-2">Ages 0–12 (special pricing applies)</p>
            </div>
            <div className="flex items-center justify-center gap-6 mb-8">
              <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Minus size={24} /></button>
              <span className="text-5xl font-bold text-[#0B3B8C]">{children}</span>
              <button type="button" onClick={() => setChildren(Math.min(10, children + 1))} className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Plus size={24} /></button>
            </div>
            <div className="bg-[#F4E7D3] rounded-xl p-4 text-sm text-gray-600 text-center">
              <p className="font-medium text-[#0B3B8C] mb-1">Child Pricing Policy</p>
              <p>Under 5 years: Free &nbsp;|&nbsp; Ages 5–11: 75% of adult rate &nbsp;|&nbsp; Ages 12+: Adult rate</p>
            </div>
          </div>
        )}

        {/* Step 8: Budget */}
        {step === 8 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Star className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>What is your budget range?</h2>
              <p className="text-gray-500 mt-2">Per person, excluding international flights</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgetRanges.map(b => (
                <button type="button" key={b.id} onClick={() => setBudget(b.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${budget === b.id ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-gray-200 hover:border-[#0B3B8C]'}`}>
                  <div className="font-bold text-[#0B3B8C]">{b.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{b.desc}</div>
                  {budget === b.id && <Check className="text-[#D4A017] mt-2" size={18} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 9: Zanzibar Tours */}
        {step === 9 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>Select Zanzibar Tours</h2>
              <p className="text-gray-500 mt-2">Choose your island experiences (optional)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tourOptions.map((tour, idx) => (
                <button type="button" key={`${tour.id}-${idx}`} onClick={() => toggleItem(tour.id, selectedTours, setSelectedTours)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTours.includes(tour.id) ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-gray-200 hover:border-[#0B3B8C]'}`}>
                  <div className="font-semibold text-[#0B3B8C] text-sm">{tour.name}</div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-500">{tour.duration}</span>
                    <span className="text-[#D4A017] font-bold">${tour.price}/pp</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-[#0B3B8C] mb-3">Tanzania Safaris</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safariOptions.map(safari => (
                  <button type="button" key={safari.id} onClick={() => toggleItem(safari.id, selectedSafaris, setSelectedSafaris)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedSafaris.includes(safari.id) ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-gray-200 hover:border-[#0B3B8C]'}`}>
                    <div className="font-semibold text-[#0B3B8C] text-sm">{safari.name}</div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-gray-500">{safari.duration}</span>
                      <span className="text-[#D4A017] font-bold">${safari.price}/pp</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-[#0B3B8C] mb-3">Airport Transfers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {transferOptions.map(transfer => (
                  <button type="button" key={transfer.id} onClick={() => toggleItem(transfer.id, selectedTransfers, setSelectedTransfers)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${selectedTransfers.includes(transfer.id) ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-gray-200 hover:border-[#0B3B8C]'}`}>
                    <span className="font-medium text-[#0B3B8C] text-sm">{transfer.name}</span>
                    <span className="text-[#D4A017] font-bold text-sm">${transfer.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Accommodation */}
        {step === 10 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-[#0B3B8C]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>Hotel Category</h2>
              <p className="text-gray-500 mt-2">We'll match you with the best options in your range</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hotelCategories.map(cat => (
                <button type="button" key={cat.id} onClick={() => setHotelCategory(cat.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${hotelCategory === cat.id ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-gray-200 hover:border-[#0B3B8C]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-[#0B3B8C]">{cat.name}</span>
                    <span className="text-[#D4A017] font-bold">${cat.pricePerNight}/night</span>
                  </div>
                  <p className="text-gray-500 text-sm">{cat.desc}</p>
                  {hotelCategory === cat.id && <Check className="text-[#D4A017] mt-2" size={20} />}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (optional)</label>
              <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={3}
                placeholder="Honeymoon setup, dietary requirements, accessibility needs, specific room type..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0B3B8C] focus:outline-none resize-none" />
            </div>
          </div>
        )}

        {/* Step 11: Review & Submit */}
        {step === 11 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Star className="w-12 h-12 mx-auto mb-4 text-[#D4A017]" />
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>Review Your Trip Request</h2>
              <p className="text-gray-500 mt-2">Confirm everything looks correct before submitting</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-[#0B3B8C] mb-3">Your Details</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{fullName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">WhatsApp:</span><span className="font-medium">{whatsapp}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-medium">{email}</span></div>
                  {country && <div className="flex justify-between"><span className="text-gray-500">Country:</span><span className="font-medium">{country}</span></div>}
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-[#0B3B8C] mb-3">Trip Details</h3>
                <div className="space-y-1.5 text-sm">
                  {selectedDestination && <div className="flex justify-between"><span className="text-gray-500">Destination:</span><span className="font-medium">{selectedDestination}</span></div>}
                  {selectedExperience && <div className="flex justify-between"><span className="text-gray-500">Experience:</span><span className="font-medium">{selectedExperience}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Arrival:</span><span className="font-medium">{arrivalDate || 'Flexible'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Departure:</span><span className="font-medium">{departureDate || 'Flexible'}</span></div>
                  {nights > 0 && <div className="flex justify-between"><span className="text-gray-500">Nights:</span><span className="font-bold text-[#D4A017]">{nights}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Guests:</span><span className="font-medium">{adults} adults{children > 0 ? `, ${children} children` : ''}</span></div>
                  {budget && <div className="flex justify-between"><span className="text-gray-500">Budget:</span><span className="font-medium">{budgetRanges.find(b => b.id === budget)?.label}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Hotel:</span><span className="font-medium capitalize">{hotelCategory}</span></div>
                </div>
              </div>

              {(selectedTours.length > 0 || selectedSafaris.length > 0 || selectedTransfers.length > 0) && (
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-[#0B3B8C] mb-3">Selected Experiences</h3>
                  <div className="space-y-1.5 text-sm">
                    {selectedTours.length > 0 && <div className="flex justify-between"><span className="text-gray-500">Tours:</span><span className="font-medium">{selectedTours.length} selected</span></div>}
                    {selectedSafaris.length > 0 && <div className="flex justify-between"><span className="text-gray-500">Safaris:</span><span className="font-medium">{selectedSafaris.length} selected</span></div>}
                    {selectedTransfers.length > 0 && <div className="flex justify-between"><span className="text-gray-500">Transfers:</span><span className="font-medium">{selectedTransfers.length} selected</span></div>}
                  </div>
                </div>
              )}

              {calculateTotal() > 0 && (
                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#0B3B8C]">Estimated Total</span>
                    <span className="text-2xl font-bold text-[#D4A017]">${calculateTotal().toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">*Indicative only. Final price confirmed after review.</p>
                </div>
              )}
            </div>

            <button type="button" onClick={handleSubmit} disabled={submitting} className="w-full bg-gradient-to-r from-[#D4A017] to-[#c49010] text-white font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit Trip Request <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        )}

        <div className="flex justify-between mt-12">
          <button type="button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-600 hover:border-[#0B3B8C] hover:text-[#0B3B8C] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={18} /> Back
          </button>
          {step < TOTAL_STEPS && (
            <button type="button" onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#0B3B8C] text-white hover:bg-[#0a3280] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Live Weather Reference Widget for easy scheduling */}
        <div className="mt-16 bg-gray-50 p-6 rounded-3xl border border-gray-150">
          <WeatherWidget />
        </div>
      </section>
    </div>
  );
}
