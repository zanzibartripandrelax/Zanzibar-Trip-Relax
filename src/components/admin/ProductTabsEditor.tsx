import React, { useState } from 'react';
import { 
  Save, History, ArrowLeft, ArrowRight, HelpCircle, Plus, Trash, 
  MapPin, PlusCircle, Check, Star, ShieldCheck, ClipboardList, RefreshCw, Eye
} from 'lucide-react';
import ProductImageUpload from './ProductImageUpload';

interface ProductTabsEditorProps {
  product: any;
  productType: string;
  session: { name: string; role: string } | null;
  onChange: (updated: any) => void;
  onSave: (pkg: any, isAutosave?: boolean) => void;
  onClose: () => void;
  versionHistory: any[];
  onRestoreVersion: (version: any) => void;
  onPreview: (pkg: any) => void;
}

export default function ProductTabsEditor({
  product,
  productType,
  session,
  onChange,
  onSave,
  onClose,
  versionHistory,
  onRestoreVersion,
  onPreview
}: ProductTabsEditorProps) {
  const [activeTab, setActiveTab] = useState('General');

  // Role Permissions
  const role = session?.role || 'Reservation Team';
  const canEdit = role === 'Owner' || role === 'Admin' || role === 'Super Admin' || role === 'super_admin' || role === 'Marketing' || role === 'Staff';
  const canPublish = role === 'Owner' || role === 'Admin' || role === 'Super Admin' || role === 'super_admin';

  const tabsList = [
    'General', 
    'Pricing', 
    'Transport', 
    'Gallery', 
    'Videos', 
    'Itinerary', 
    'Accommodation', 
    'Included & Excluded', 
    'FAQs', 
    'Policies', 
    'Sustainability', 
    'SEO', 
    'Reviews', 
    'Publish'
  ];

  // Helper to generate dynamic slug
  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    onChange({ ...product, title, slug });
  };

  // Itinerary helpers
  const handleAddItineraryDay = () => {
    const nextDay = (product.detailedItinerary?.length || 0) + 1;
    const newDay = {
      id: `day-${Date.now()}`,
      dayNumber: nextDay,
      title: `Day ${nextDay} - Exciting Excursion`,
      desc: 'Engage in premium sightseeing excursions led by professional multilingual guides.',
      meals: { breakfast: true, lunch: true, dinner: false },
      accommodation: 'Standard Beachfront Resort',
      activities: 'Scenic Walks, Photo sessions',
      travelTime: '1 Hour',
      mapLocation: 'Zanzibar Island',
      notes: 'Pack comfortable shoes.'
    };
    onChange({
      ...product,
      detailedItinerary: [...(product.detailedItinerary || []), newDay]
    });
  };

  const handleRemoveItineraryDay = (id: string) => {
    const filtered = (product.detailedItinerary || []).filter((d: any) => d.id !== id);
    const renumbered = filtered.map((d: any, idx: number) => ({ ...d, dayNumber: idx + 1 }));
    onChange({ ...product, detailedItinerary: renumbered });
  };

  // Accommodations helpers
  const handleAddHotel = () => {
    const newHotel = {
      id: `hotel-${Date.now()}`,
      hotelName: 'Boutique Seaside Resort',
      category: 'Luxury 5★',
      roomType: 'Superior Ocean Suite',
      mealPlan: 'Half Board',
      description: 'Stellar boutique property overlooking turquoise ocean tides.',
      upgradeOptions: 'Premium Sea View Penthouse (+$110/night)'
    };
    onChange({
      ...product,
      accommodations: [...(product.accommodations || []), newHotel]
    });
  };

  // Group Discounts helpers
  const handleAddDiscount = () => {
    onChange({
      ...product,
      groupDiscounts: [...(product.groupDiscounts || []), { minGuests: 4, discountPercent: 10 }]
    });
  };

  // Addons helpers
  const handleAddAddon = () => {
    onChange({
      ...product,
      addOns: [...(product.addOns || []), { id: `add-${Date.now()}`, name: 'Premium Spice Farm Excursion', price: 35 }]
    });
  };

  // FAQs helpers
  const handleAddFaq = () => {
    onChange({
      ...product,
      faqs: [...(product.faqs || []), { id: `faq-${Date.now()}`, question: 'Is airport pick-up private?', answer: 'Yes, transfers are exclusively private for your group.', category: 'Transfers' }]
    });
  };

  // Reviews helpers
  const handleAddReview = () => {
    onChange({
      ...product,
      reviews: [...(product.reviews || []), { id: `rev-${Date.now()}`, reviewerName: 'John Doe', rating: 5, comments: 'Stellar experience! Seamless arrangements and great support.', approved: true }]
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0A1224] p-6 rounded-3xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-xl text-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase">{product.code || 'CODE-NEW'}</span>
              <span className="text-xs font-black text-[#D4A017] uppercase tracking-widest">{product.category}</span>
            </div>
            <h4 className="font-bold text-slate-100 text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
              {product.title || 'Scaffold New Travel Product'}
            </h4>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => onPreview(product)}
            className="bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 border border-white/5 transition-all w-full sm:w-auto"
          >
            <Eye size={14} className="text-[#D4A017]" />
            <span>Interactive Preview</span>
          </button>
          
          {canEdit && (
            <button 
              onClick={() => onSave(product, false)}
              className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-xs font-black py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md w-full sm:w-auto shrink-0 uppercase tracking-wider"
            >
              <Save size={14} />
              <span>Save Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1.5 bg-[#0A1224] p-1.5 rounded-2xl border border-white/5 min-w-[1100px]">
          {tabsList.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-[11px] font-bold py-2 px-3 rounded-xl transition-all cursor-pointer text-center outline-none ${
                activeTab === tab 
                  ? 'bg-[#D4A017] text-[#020C1F]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main tabs view col */}
        <div className="lg:col-span-9 bg-[#0A1224] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 min-h-[450px]">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'General' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">General Specifications</h4>
                <p className="text-[10px] text-slate-400">Configure public titles, slug paths, categories, and tags.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Product Name / Title</label>
                  <input 
                    type="text" 
                    value={product.title || ''}
                    disabled={!canEdit}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. 7-Day Romantic Beach Honeymoon Zanzibar"
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#D4A017] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">URL Slug (Auto-generated)</label>
                  <input 
                    type="text" 
                    value={product.slug || ''}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, slug: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#D4A017] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Unique Product Code</label>
                  <input 
                    type="text" 
                    value={product.code || ''}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, code: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#D4A017] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Specific Sub-Category</label>
                  <input 
                    type="text" 
                    value={product.packageCategory || product.category || ''}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, packageCategory: e.target.value })}
                    placeholder="Honeymoon, Family, Budget, etc."
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#D4A017] outline-none"
                  />
                </div>

                {/* PRODUCT TYPE CONDITIONAL FIELDS */}
                {productType === 'tour' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Pickup Logistics</label>
                      <input 
                        type="text" 
                        value={product.pickup || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, pickup: e.target.value })}
                        placeholder="Stone Town, Airport, Nungwi Hotels"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Meeting Point Area</label>
                      <input 
                        type="text" 
                        value={product.meetingPoint || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, meetingPoint: e.target.value })}
                        placeholder="Forodhani Gardens flagpole"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Boat Vessel Details</label>
                      <input 
                        type="text" 
                        value={product.boat || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, boat: e.target.value })}
                        placeholder="Traditional Swahili Sailing Dhow with canopy"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Tour Guide Specialties</label>
                      <input 
                        type="text" 
                        value={product.guide || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, guide: e.target.value })}
                        placeholder="Licensed Swahili Historian speaking EN, FR, IT"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                  </>
                )}

                {productType === 'safari' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Safari Vehicle Class</label>
                      <input 
                        type="text" 
                        value={product.safariVehicle || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, safariVehicle: e.target.value })}
                        placeholder="4x4 Land Cruiser with pop-up roof"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Key Wildlife Species to Spot</label>
                      <input 
                        type="text" 
                        value={product.wildlife || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, wildlife: e.target.value })}
                        placeholder="The Big Five: Lions, Leopards, Elephants, Cheetahs"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Daily Game Drives Count</label>
                      <input 
                        type="text" 
                        value={product.gameDrives || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, gameDrives: e.target.value })}
                        placeholder="Morning, afternoon, and night safaris"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                  </>
                )}

                {productType === 'kilimanjaro' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Climbing Route Name</label>
                      <input 
                        type="text" 
                        value={product.route || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, route: e.target.value })}
                        placeholder="Machame Route, Lemosho Route"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Difficulty Level</label>
                      <select 
                        value={product.difficulty || 'Challenging'}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, difficulty: e.target.value })}
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      >
                        <option value="Moderate">Moderate Success Rate</option>
                        <option value="Challenging">Challenging / Technical</option>
                        <option value="Extreme">Extreme Alpine Climb</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Maximum Summit Elevation</label>
                      <input 
                        type="text" 
                        value={product.elevation || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, elevation: e.target.value })}
                        placeholder="5,895 Meters (Uhuru Peak)"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Acclimatization Schedule</label>
                      <input 
                        type="text" 
                        value={product.acclimatization || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, acclimatization: e.target.value })}
                        placeholder="Climb high, sleep low daily strategy"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                  </>
                )}

                {productType === 'transfer' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Pickup Airport Zone</label>
                      <input 
                        type="text" 
                        value={product.pickupZone || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, pickupZone: e.target.value })}
                        placeholder="Abeid Amani Karume International Airport (ZNZ)"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Destination Resort Zone</label>
                      <input 
                        type="text" 
                        value={product.destination || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, destination: e.target.value })}
                        placeholder="Nungwi / Kendwa / Paje Beach Resorts"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Vehicle Capacity</label>
                      <input 
                        type="text" 
                        value={product.vehicleCapacity || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, vehicleCapacity: e.target.value })}
                        placeholder="Up to 6 guests with suitcases"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#D4A017] block uppercase tracking-wider">Complimentary Waiting Time</label>
                      <input 
                        type="text" 
                        value={product.waitingTime || ''}
                        disabled={!canEdit}
                        onChange={(e) => onChange({ ...product, waitingTime: e.target.value })}
                        placeholder="60 minutes from flight landing"
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                    </div>
                  </>
                )}

              </div>

              {/* Text Short Summary */}
              <div className="space-y-1.5 pt-4">
                <label className="text-[11px] font-bold text-slate-300 block">Short Description / Pitch</label>
                <textarea 
                  rows={3}
                  value={product.shortSummary || product.desc || ''}
                  disabled={!canEdit}
                  onChange={(e) => onChange({ ...product, shortSummary: e.target.value, desc: e.target.value })}
                  placeholder="Summarize the core appeal of this travel catalog."
                  className="w-full bg-[#121B30] border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-[#D4A017]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING */}
          {activeTab === 'Pricing' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Automated Pricing System</h4>
                <p className="text-[10px] text-slate-400">Configure adult base rates, infant ratios, single supplements, taxes, and group discounts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Base Price (Adult USD)</label>
                  <input 
                    type="number" 
                    value={product.basePrice || product.price || 0}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, basePrice: Number(e.target.value), price: String(e.target.value) })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Child Price (USD)</label>
                  <input 
                    type="number" 
                    value={product.childPrice || 0}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, childPrice: Number(e.target.value) })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Infant Price (USD)</label>
                  <input 
                    type="number" 
                    value={product.infantPrice || 0}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, infantPrice: Number(e.target.value) })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Single Supplement Fee (USD)</label>
                  <input 
                    type="number" 
                    value={product.singleSupplement || 0}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, singleSupplement: Number(e.target.value) })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Conservation & Park Fees (USD)</label>
                  <input 
                    type="number" 
                    value={product.parkFees || 0}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, parkFees: Number(e.target.value) })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Local Infrastructure Taxes (%)</label>
                  <input 
                    type="number" 
                    value={product.taxes || 0}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, taxes: Number(e.target.value) })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Group discounts array builder */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Interactive Group Discounts</label>
                  {canEdit && (
                    <button 
                      onClick={handleAddDiscount}
                      className="bg-[#D4A017]/10 hover:bg-[#D4A017]/25 text-[#D4A017] text-[10px] font-black py-1.5 px-3 rounded-lg border border-[#D4A017]/30 transition-all uppercase"
                    >
                      Add Tier
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {(!product.groupDiscounts || product.groupDiscounts.length === 0) ? (
                    <p className="text-[10px] text-slate-500 italic">No custom group discounts registered. Click to add a pricing tier.</p>
                  ) : (
                    product.groupDiscounts.map((gd: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center bg-[#121B30] p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-slate-400 font-bold">Tier #{idx+1}</span>
                        <div className="flex gap-2 items-center">
                          <label className="text-[10px] text-slate-400">Min Guests</label>
                          <input 
                            type="number" 
                            value={gd.minGuests || 4}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.groupDiscounts];
                              copy[idx].minGuests = Number(e.target.value);
                              onChange({ ...product, groupDiscounts: copy });
                            }}
                            className="bg-[#0A1224] border border-white/10 rounded px-2.5 py-1 text-xs text-white w-20"
                          />
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="text-[10px] text-slate-400">Discount (%)</label>
                          <input 
                            type="number" 
                            value={gd.discountPercent || 10}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.groupDiscounts];
                              copy[idx].discountPercent = Number(e.target.value);
                              onChange({ ...product, groupDiscounts: copy });
                            }}
                            className="bg-[#0A1224] border border-white/10 rounded px-2.5 py-1 text-xs text-white w-20"
                          />
                        </div>
                        {canEdit && (
                          <button 
                            onClick={() => {
                              const copy = product.groupDiscounts.filter((_: any, i: number) => i !== idx);
                              onChange({ ...product, groupDiscounts: copy });
                            }}
                            className="text-red-400 hover:text-red-500 ml-auto bg-transparent border-none outline-none cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSPORT */}
          {activeTab === 'Transport' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Transport, Logistics, and Fleet Details</h4>
                <p className="text-[10px] text-slate-400">Manage dropoff locations, pickup schedules, vehicle models, and flight trackers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Pickup Transfer Included?</label>
                  <select 
                    value={product.pickupIncluded || 'Yes'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, pickupIncluded: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  >
                    <option value="Yes">Yes, 100% Private Transfers Included</option>
                    <option value="No">No, Excluded</option>
                    <option value="Optional">Optional Add-on</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Primary Vehicle Specification</label>
                  <input 
                    type="text" 
                    value={product.transferType || product.vehicleType || 'Executive Air-Conditioned Minivan'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, transferType: e.target.value, vehicleType: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Default Departure Pick-up Time</label>
                  <input 
                    type="text" 
                    value={product.pickupTime || '08:30 AM'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, pickupTime: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Expected Return / Drop-off Time</label>
                  <input 
                    type="text" 
                    value={product.dropoffTime || '04:30 PM'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, dropoffTime: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GALLERY */}
          {activeTab === 'Gallery' && (
            <ProductImageUpload product={product} onChange={onChange} />
          )}

          {/* TAB 5: VIDEOS */}
          {activeTab === 'Videos' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Promotional Video Materials</h4>
                <p className="text-[10px] text-slate-400">Embed verified YouTube or Vimeo URLs to showcase breathtaking footage of the destination.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Main Promotional Video URL</label>
                  <input 
                    type="text" 
                    value={product.promoVideoUrl || ''}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, promoVideoUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#D4A017] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ITINERARY */}
          {activeTab === 'Itinerary' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Daily Excursion Program Builder</h4>
                  <p className="text-[10px] text-slate-400">Build interactive timeline cards mapping out daily routes, meals, activities, and drives.</p>
                </div>
                {canEdit && (
                  <button 
                    onClick={handleAddItineraryDay}
                    className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-[10px] font-black py-2 px-4 rounded-xl flex items-center gap-1 cursor-pointer outline-none border-none transition-all shadow"
                  >
                    <Plus size={12} /> Add Day
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {(!product.detailedItinerary || product.detailedItinerary.length === 0) ? (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center text-slate-500">
                    <ClipboardList className="mx-auto text-slate-600 mb-2" size={28} />
                    <p className="text-xs font-bold">No custom daily programs saved yet.</p>
                    <p className="text-[10px]">Click "Add Day" above to map out beautiful daily schedules.</p>
                  </div>
                ) : (
                  product.detailedItinerary.map((day: any, idx: number) => (
                    <div key={day.id || idx} className="bg-[#121B30] border border-white/10 rounded-2xl p-5 space-y-4 relative">
                      <div className="flex justify-between items-center">
                        <span className="bg-[#D4A017]/10 text-[#D4A017] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Day {day.dayNumber || idx + 1} Program
                        </span>
                        {canEdit && (
                          <button 
                            onClick={() => handleRemoveItineraryDay(day.id)}
                            className="text-red-400 hover:text-red-500 bg-transparent border-none cursor-pointer outline-none"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">Day Program Title</label>
                          <input 
                            type="text" 
                            value={day.title || ''}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.detailedItinerary];
                              copy[idx].title = e.target.value;
                              onChange({ ...product, detailedItinerary: copy });
                            }}
                            className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">Key Excursion Activities</label>
                          <input 
                            type="text" 
                            value={day.activities || ''}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.detailedItinerary];
                              copy[idx].activities = e.target.value;
                              onChange({ ...product, detailedItinerary: copy });
                            }}
                            className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">Daily Route Destination</label>
                          <input 
                            type="text" 
                            value={day.mapLocation || ''}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.detailedItinerary];
                              copy[idx].mapLocation = e.target.value;
                              onChange({ ...product, detailedItinerary: copy });
                            }}
                            className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">Accommodation / Resort Stay</label>
                          <input 
                            type="text" 
                            value={day.accommodation || ''}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.detailedItinerary];
                              copy[idx].accommodation = e.target.value;
                              onChange({ ...product, detailedItinerary: copy });
                            }}
                            className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block">Detailed Narrative</label>
                        <textarea 
                          rows={2}
                          value={day.desc || ''}
                          disabled={!canEdit}
                          onChange={(e) => {
                            const copy = [...product.detailedItinerary];
                            copy[idx].desc = e.target.value;
                            onChange({ ...product, detailedItinerary: copy });
                          }}
                          className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-3 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: ACCOMMODATION */}
          {activeTab === 'Accommodation' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Premium Lodging and Resort Selections</h4>
                  <p className="text-[10px] text-slate-400">Configure partner hotel names, grading stars, room categories, and meal arrangements.</p>
                </div>
                {canEdit && (
                  <button 
                    onClick={handleAddHotel}
                    className="bg-[#D4A017]/10 hover:bg-[#D4A017]/25 text-[#D4A017] text-[10px] font-black py-2 px-4 rounded-xl border border-[#D4A017]/30 transition-all uppercase"
                  >
                    Add Hotel
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {(!product.accommodations || product.accommodations.length === 0) ? (
                  <p className="text-[10px] text-slate-500 italic">No partner hotels attached to this catalog yet. Click Add Hotel above.</p>
                ) : (
                  product.accommodations.map((hotel: any, idx: number) => (
                    <div key={hotel.id || idx} className="bg-[#121B30] border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-300">Lodging Stay #{idx+1}</span>
                        {canEdit && (
                          <button 
                            onClick={() => {
                              const copy = product.accommodations.filter((h: any) => h.id !== hotel.id);
                              onChange({ ...product, accommodations: copy });
                            }}
                            className="text-red-400 hover:text-red-500 bg-transparent border-none cursor-pointer outline-none"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Hotel Name</label>
                          <input 
                            type="text" 
                            value={hotel.hotelName || ''}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.accommodations];
                              copy[idx].hotelName = e.target.value;
                              onChange({ ...product, accommodations: copy });
                            }}
                            className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Grading / Star category</label>
                          <input 
                            type="text" 
                            value={hotel.category || 'Luxury 5★'}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.accommodations];
                              copy[idx].category = e.target.value;
                              onChange({ ...product, accommodations: copy });
                            }}
                            className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 8: INCLUDED & EXCLUDED */}
          {activeTab === 'Included & Excluded' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">What's Included & Excluded</h4>
                <p className="text-[10px] text-slate-400">Manage fine-print inclusions and exclusions for clear expectations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* INCLUSIONS BUILDER */}
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">✓ Included in Rate</span>
                    {canEdit && (
                      <button 
                        onClick={() => {
                          const current = product.whatsIncluded || product.included || [];
                          onChange({ ...product, whatsIncluded: [...current, 'New inclusion point'] });
                        }}
                        className="text-emerald-400 bg-transparent hover:opacity-80 font-bold text-[9px] uppercase border-none cursor-pointer outline-none"
                      >
                        + Add Item
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {((product.whatsIncluded || product.included || []).length === 0) ? (
                      <p className="text-[10px] text-slate-500 italic">No inclusions specified yet.</p>
                    ) : (
                      (product.whatsIncluded || product.included || []).map((inc: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-[#0A1224] p-2 rounded-xl border border-white/5">
                          <input 
                            type="text" 
                            value={inc}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...(product.whatsIncluded || product.included || [])];
                              copy[idx] = e.target.value;
                              onChange({ ...product, whatsIncluded: copy, included: copy });
                            }}
                            className="bg-transparent border-none text-xs text-slate-200 w-full focus:outline-none focus:text-[#D4A017]"
                          />
                          {canEdit && (
                            <button 
                              onClick={() => {
                                const copy = (product.whatsIncluded || product.included || []).filter((_: any, i: number) => i !== idx);
                                onChange({ ...product, whatsIncluded: copy, included: copy });
                              }}
                              className="text-red-400 hover:text-red-500 bg-transparent border-none cursor-pointer"
                            >
                              <Trash size={12} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* EXCLUSIONS BUILDER */}
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-xs font-black text-red-400 uppercase tracking-wider">✗ Excluded from Rate</span>
                    {canEdit && (
                      <button 
                        onClick={() => {
                          const current = product.whatsExcluded || product.excluded || [];
                          onChange({ ...product, whatsExcluded: [...current, 'New exclusion point'] });
                        }}
                        className="text-red-400 bg-transparent hover:opacity-80 font-bold text-[9px] uppercase border-none cursor-pointer outline-none"
                      >
                        + Add Item
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {((product.whatsExcluded || product.excluded || []).length === 0) ? (
                      <p className="text-[10px] text-slate-500 italic">No exclusions specified yet.</p>
                    ) : (
                      (product.whatsExcluded || product.excluded || []).map((exc: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-[#0A1224] p-2 rounded-xl border border-white/5">
                          <input 
                            type="text" 
                            value={exc}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...(product.whatsExcluded || product.excluded || [])];
                              copy[idx] = e.target.value;
                              onChange({ ...product, whatsExcluded: copy, excluded: copy });
                            }}
                            className="bg-transparent border-none text-xs text-slate-200 w-full focus:outline-none focus:text-[#D4A017]"
                          />
                          {canEdit && (
                            <button 
                              onClick={() => {
                                const copy = (product.whatsExcluded || product.excluded || []).filter((_: any, i: number) => i !== idx);
                                onChange({ ...product, whatsExcluded: copy, excluded: copy });
                              }}
                              className="text-red-400 hover:text-red-500 bg-transparent border-none cursor-pointer"
                            >
                              <Trash size={12} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: FAQS */}
          {activeTab === 'FAQs' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Interactive Guest FAQ Catalog</h4>
                  <p className="text-[10px] text-slate-400">Map out direct answers regarding safety, logistics, gear checklists, and refund options.</p>
                </div>
                {canEdit && (
                  <button 
                    onClick={handleAddFaq}
                    className="bg-[#D4A017]/10 hover:bg-[#D4A017]/25 text-[#D4A017] text-[10px] font-black py-2 px-4 rounded-xl border border-[#D4A017]/30 transition-all uppercase"
                  >
                    Add FAQ
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {(!product.faqs || product.faqs.length === 0) ? (
                  <p className="text-[10px] text-slate-500 italic">No custom FAQs defined yet. Click Add FAQ above.</p>
                ) : (
                  product.faqs.map((faq: any, idx: number) => (
                    <div key={faq.id || idx} className="bg-[#121B30] border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={faq.question || ''}
                          disabled={!canEdit}
                          onChange={(e) => {
                            const copy = [...product.faqs];
                            copy[idx].question = e.target.value;
                            onChange({ ...product, faqs: copy });
                          }}
                          placeholder="FAQ Question?"
                          className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        {canEdit && (
                          <button 
                            onClick={() => {
                              const copy = product.faqs.filter((f: any) => f.id !== faq.id);
                              onChange({ ...product, faqs: copy });
                            }}
                            className="text-red-400 hover:text-red-500 ml-auto bg-transparent border-none cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                      <textarea 
                        rows={2}
                        value={faq.answer || ''}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const copy = [...product.faqs];
                          copy[idx].answer = e.target.value;
                          onChange({ ...product, faqs: copy });
                        }}
                        placeholder="Answer narrative..."
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-3 text-xs text-white"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 10: POLICIES */}
          {activeTab === 'Policies' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Cancellation & Operational Policies</h4>
                <p className="text-[10px] text-slate-400">Configure fine-print terms for cancellation, refunds, children guidelines, and extra luggage limits.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Cancellation & Refund Terms</label>
                  <textarea 
                    rows={3}
                    value={product.cancellationPolicy || '100% refund up to 7 days prior to departure. 50% refund between 3 to 6 days.'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, cancellationPolicy: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl p-4 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Children & Infant Occupancy Policy</label>
                  <textarea 
                    rows={3}
                    value={product.childPolicy || 'Children under 3 years travel free. Children under 12 years are eligible for child rates.'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, childPolicy: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl p-4 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Weather & Force Majeure Guidelines</label>
                  <textarea 
                    rows={3}
                    value={product.forceMajeurePolicy || 'In case of severe ocean conditions, boat tours will be rescheduled or fully refunded.'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, forceMajeurePolicy: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl p-4 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SUSTAINABILITY */}
          {activeTab === 'Sustainability' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Eco-Protection & Community Contribution Values</h4>
                <p className="text-[10px] text-slate-400">Configure parameters for porter welfare (KPAP), carbon offsetting, and native village schools.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Local Village School Funding Notes</label>
                  <textarea 
                    rows={2}
                    value={product.communityBenefits || '10% of booking revenue directly supports local village primary education programs.'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, communityBenefits: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl p-4 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Eco-friendly Initiatives (e.g. Plastic Free)</label>
                  <textarea 
                    rows={2}
                    value={product.ecoFriendlyPractices || '100% single-use plastic free. Refillable mineral water flasks provided for all guests.'}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, ecoFriendlyPractices: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl p-4 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SEO */}
          {activeTab === 'SEO' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Search Engine Optimization Meta Parameters</h4>
                <p className="text-[10px] text-slate-400">Configure target keywords, structured search snippets, and browser browser headers.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Meta Page Title</label>
                  <input 
                    type="text" 
                    value={product.metaTitle || ''}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, metaTitle: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Meta Description</label>
                  <textarea 
                    rows={3}
                    value={product.metaDescription || ''}
                    disabled={!canEdit}
                    onChange={(e) => onChange({ ...product, metaDescription: e.target.value })}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl p-4 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: REVIEWS */}
          {activeTab === 'Reviews' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Guest Feedback & Review Registers</h4>
                  <p className="text-[10px] text-slate-400">Approve or edit feedback submissions and adjust public star metrics.</p>
                </div>
                {canEdit && (
                  <button 
                    onClick={handleAddReview}
                    className="bg-[#D4A017]/10 hover:bg-[#D4A017]/25 text-[#D4A017] text-[10px] font-black py-2 px-4 rounded-xl border border-[#D4A017]/30 transition-all uppercase"
                  >
                    Add Review
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {(!product.reviews || product.reviews.length === 0) ? (
                  <p className="text-[10px] text-slate-500 italic">No feedback registered on this product yet. Click Add Review above.</p>
                ) : (
                  product.reviews.map((rev: any, idx: number) => (
                    <div key={rev.id || idx} className="bg-[#121B30] border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={rev.reviewerName || 'Reviewer'}
                          disabled={!canEdit}
                          onChange={(e) => {
                            const copy = [...product.reviews];
                            copy[idx].reviewerName = e.target.value;
                            onChange({ ...product, reviews: copy });
                          }}
                          className="bg-[#0A1224] border border-white/10 rounded px-3 py-1.5 text-xs text-white"
                        />
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400 fill-yellow-400" size={12} />
                          <input 
                            type="number" 
                            min={1} 
                            max={5}
                            value={rev.rating || 5}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...product.reviews];
                              copy[idx].rating = Number(e.target.value);
                              onChange({ ...product, reviews: copy });
                            }}
                            className="bg-[#0A1224] border border-white/10 rounded px-2 py-1 text-xs text-white w-12"
                          />
                        </div>
                        {canEdit && (
                          <button 
                            onClick={() => {
                              const copy = product.reviews.filter((r: any) => r.id !== rev.id);
                              onChange({ ...product, reviews: copy });
                            }}
                            className="text-red-400 hover:text-red-500 ml-auto bg-transparent border-none cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                      <textarea 
                        rows={2}
                        value={rev.comments || ''}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const copy = [...product.reviews];
                          copy[idx].comments = e.target.value;
                          onChange({ ...product, reviews: copy });
                        }}
                        className="w-full bg-[#0A1224] border border-white/10 rounded p-3 text-xs text-slate-300"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 14: PUBLISH */}
          {activeTab === 'Publish' && (
            <div className="space-y-6 text-left">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Publishing Controls & Approvals Workflow</h4>
                <p className="text-[10px] text-slate-400">Complete formal authorization logs, choose visual states, and verify database security parameters.</p>
              </div>

              <div className="bg-[#121B30] p-6 rounded-2xl border border-white/10 space-y-4">
                <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">Select Catalog Visibility Status</label>
                
                <div className="flex flex-wrap gap-2.5">
                  {['Draft', 'Pending Approval', 'Published', 'Archived'].map((visStatus) => {
                    const isSelected = product.status === visStatus;
                    const isDisabled = !canPublish && (visStatus === 'Published' || visStatus === 'Archived');
                    
                    return (
                      <button 
                        key={visStatus}
                        disabled={isDisabled}
                        onClick={() => onChange({ ...product, status: visStatus })}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-[#D4A017] text-[#020C1F] border-[#D4A017] shadow' 
                            : 'bg-[#0A1224] text-slate-400 border-white/10 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                      >
                        <span>{visStatus}</span>
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>

                {!canPublish && (
                  <p className="text-[10px] text-yellow-400 leading-relaxed italic">
                    * As Staff Member / Marketing, you can save edits and submit for approval. LIVE publishing requires Owner or Admin approval.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Log Rollback Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0A1224] border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <History size={14} className="text-[#D4A017]" />
              <span>Version History Log</span>
            </h4>
            
            {versionHistory.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No save versions captured for this product yet. Versions auto-commit on every manual save action.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {versionHistory.map((v: any, index: number) => (
                  <div key={v.versionId || index} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-2 hover:border-[#D4A017]/30 transition-all text-left">
                    <div className="flex justify-between items-center text-[8px]">
                      <span className="font-mono text-slate-400">{v.timestamp}</span>
                      <span className="bg-[#D4A017]/10 text-[#D4A017] px-1 py-0.5 rounded uppercase font-black">{v.role || 'Staff'}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-bold truncate">By: {v.updatedBy || 'Staff'}</p>
                    <button 
                      onClick={() => onRestoreVersion(v)}
                      className="w-full bg-white/5 hover:bg-white/10 text-slate-200 text-[8px] font-bold py-1 px-2 rounded border border-white/5 cursor-pointer uppercase transition-all"
                    >
                      Restore Rollback
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
