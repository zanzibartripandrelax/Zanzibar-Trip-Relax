import React, { useState, useEffect } from 'react';
import { Save, X, Trash2, Plus, Image as ImageIcon, Globe, MapPin, DollarSign, Clock, Settings, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { TourItem, ItineraryDay } from '../../lib/cmsStore';
import { RichItineraryEditor } from './RichItineraryEditor';

interface TourEditorProps {
  tour: Partial<TourItem>;
  onSave: (tour: TourItem) => void;
  onCancel: () => void;
}

export const TourEditor: React.FC<TourEditorProps> = ({ tour, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<TourItem>>({
    id: tour.id || `tour-${Date.now()}`,
    title: tour.title || '',
    slug: tour.slug || '',
    category: tour.category || 'tour',
    shortDesc: tour.shortDesc || '',
    longDescription: tour.longDescription || '',
    price: tour.price || '$0',
    discountPrice: tour.discountPrice || '',
    duration: tour.duration || '',
    location: tour.location || '',
    difficulty: tour.difficulty || 'Easy',
    img: tour.img || '',
    gallery: tour.gallery || [],
    highlights: tour.highlights || [],
    included: tour.included || [],
    excluded: tour.excluded || [],
    itineraryDays: tour.itineraryDays || [],
    visible: tour.visible ?? true,
    archived: tour.archived ?? false,
    featured: tour.featured ?? false,
    seoTitle: tour.seoTitle || '',
    seoDescription: tour.seoDescription || '',
    metaKeywords: tour.metaKeywords || [],
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'itinerary' | 'seo'>('basic');

  useEffect(() => {
    // Auto-generate slug from title if slug is empty
    if (formData.title && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: formData.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  }, [formData.title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleArrayChange = (field: 'highlights' | 'included' | 'excluded' | 'metaKeywords', index: number, value: string) => {
    const arr = [...(formData[field] || [])];
    arr[index] = value;
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const addArrayItem = (field: 'highlights' | 'included' | 'excluded' | 'metaKeywords') => {
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  };

  const removeArrayItem = (field: 'highlights' | 'included' | 'excluded' | 'metaKeywords', index: number) => {
    setFormData(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.shortDesc) return;
    onSave(formData as TourItem);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm overflow-hidden text-[#111827]">
      <div className="bg-white text-[#111827] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#D1D5DB]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1D5DB] flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B3B8C] text-[#D4A017] flex items-center justify-center shadow-sm">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827]">
                {tour.id ? 'Edit Experience' : 'Create New Experience'}
              </h3>
              <p className="text-xs text-[#6B7280]">Configure global visibility, rich itinerary, and pricing for {formData.title || 'Untitled Experience'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex px-6 border-b border-[#D1D5DB] bg-slate-50/50 overflow-x-auto">
          {[
            { id: 'basic', label: 'Basic Info', icon: Settings },
            { id: 'content', label: 'Details & Inclusions', icon: FileText },
            { id: 'itinerary', label: 'Itinerary Builder', icon: MapPin },
            { id: 'seo', label: 'SEO & Meta', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-[#0B3B8C] text-[#0B3B8C] bg-white font-bold shadow-sm' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-white text-[#111827]">
          <form id="tour-editor-form" onSubmit={handleSubmit} className="space-y-8">
            
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Tour Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] outline-none text-sm transition-all caret-[#111827] font-medium"
                        placeholder="e.g. Safari Blue Adventure"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">URL Slug (Auto-generated)</label>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                        <span className="text-xs text-[#6B7280] font-semibold">/tours/</span>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleChange}
                          className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white text-[#111827] focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] outline-none text-sm transition-all font-medium cursor-pointer"
                      >
                        <option value="tour" className="bg-white text-[#111827]">Zanzibar Day Tour</option>
                        <option value="package" className="bg-white text-[#111827]">Holiday Package</option>
                        <option value="safari" className="bg-white text-[#111827]">Tanzania Safari</option>
                        <option value="kilimanjaro" className="bg-white text-[#111827]">Mount Kilimanjaro Trek</option>
                        <option value="transfer" className="bg-white text-[#111827]">Airport Transfer</option>
                        <option value="honeymoon" className="bg-white text-[#111827]">Honeymoon Special</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Price (e.g. $45)</label>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                          <DollarSign size={16} className="text-[#6B7280]" />
                          <input
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                            placeholder="$0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Duration (e.g. 5 hrs)</label>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                          <Clock size={16} className="text-[#6B7280]" />
                          <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                            placeholder="Full Day"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Featured Image URL</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white flex items-center gap-2 focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                        <ImageIcon size={16} className="text-[#6B7280]" />
                        <input
                          type="text"
                          name="img"
                          value={formData.img}
                          onChange={handleChange}
                          className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                          placeholder="https://..."
                        />
                      </div>
                      {formData.img && (
                        <img src={formData.img} className="w-12 h-12 rounded-xl object-cover border border-[#D1D5DB]" alt="Preview" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Location / Pickup Area</label>
                    <div className="px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white flex items-center gap-2 focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                      <MapPin size={16} className="text-[#6B7280]" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                        placeholder="e.g. Fumba Village"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-[#D1D5DB] grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${formData.visible ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setFormData(p => ({ ...p, visible: !p.visible }))}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.visible ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111827]">Publicly Visible</p>
                      <p className="text-[10px] text-[#6B7280]">Show on website</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${formData.featured ? 'bg-amber-500' : 'bg-slate-300'}`} onClick={() => setFormData(p => ({ ...p, featured: !p.featured }))}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.featured ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111827]">Featured Tour</p>
                      <p className="text-[10px] text-[#6B7280]">Highlight on Home</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${formData.archived ? 'bg-red-500' : 'bg-slate-300'}`} onClick={() => setFormData(p => ({ ...p, archived: !p.archived }))}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.archived ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111827]">Archived</p>
                      <p className="text-[10px] text-[#6B7280]">Historical records only</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Short Teaser Description (Listing View) *</label>
                  <textarea
                    name="shortDesc"
                    value={formData.shortDesc}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] outline-none text-sm transition-all caret-[#111827] font-medium"
                    placeholder="Short catching phrase..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Long Narrative Description (Detail Page)</label>
                  <textarea
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] outline-none text-sm transition-all caret-[#111827] font-medium"
                    placeholder="Describe the full experience, history, and vibes..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Highlights */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider">Key Highlights</label>
                      <button type="button" onClick={() => addArrayItem('highlights')} className="text-[#0B3B8C] text-xs font-bold hover:underline cursor-pointer">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {formData.highlights?.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('highlights', idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-[#D1D5DB] bg-white text-xs text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] caret-[#111827] font-medium"
                            placeholder="Key highlight..."
                          />
                          <button type="button" onClick={() => removeArrayItem('highlights', idx)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider">What's Included</label>
                      <button type="button" onClick={() => addArrayItem('included')} className="text-emerald-700 text-xs font-bold hover:underline cursor-pointer">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {formData.included?.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('included', idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-[#D1D5DB] bg-white text-xs text-[#111827] placeholder-[#6B7280] outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 caret-[#111827] font-medium"
                            placeholder="Included item..."
                          />
                          <button type="button" onClick={() => removeArrayItem('included', idx)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Excluded */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider">What's Excluded</label>
                      <button type="button" onClick={() => addArrayItem('excluded')} className="text-red-700 text-xs font-bold hover:underline cursor-pointer">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {formData.excluded?.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('excluded', idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-[#D1D5DB] bg-white text-xs text-[#111827] placeholder-[#6B7280] outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 caret-[#111827] font-medium"
                            placeholder="Excluded item..."
                          />
                          <button type="button" onClick={() => removeArrayItem('excluded', idx)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="animate-in fade-in duration-300">
                <RichItineraryEditor 
                  days={formData.itineraryDays || []} 
                  onChange={(days) => setFormData(p => ({ ...p, itineraryDays: days }))} 
                />
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-[#D1D5DB]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </div>
                    <h4 className="text-sm font-semibold text-[#1F2937] uppercase tracking-wider">Search Engine Optimization</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Meta Title</label>
                      <input
                        type="text"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] outline-none text-sm transition-all caret-[#111827] font-medium"
                        placeholder="Page title for Google search"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">Meta Description</label>
                      <textarea
                        name="seoDescription"
                        value={formData.seoDescription}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] outline-none text-sm transition-all caret-[#111827] font-medium"
                        placeholder="Brief summary shown in search results..."
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider">Keywords</label>
                        <button type="button" onClick={() => addArrayItem('metaKeywords')} className="text-[#0B3B8C] text-xs font-bold hover:underline cursor-pointer">+ Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.metaKeywords?.map((kw, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-white border border-[#D1D5DB] rounded-full pl-3 pr-2 py-1 shadow-sm">
                            <input
                              type="text"
                              value={kw}
                              onChange={(e) => handleArrayChange('metaKeywords', idx, e.target.value)}
                              className="text-xs font-semibold text-[#111827] placeholder-[#6B7280] outline-none bg-transparent w-28 caret-[#111827]"
                              placeholder="e.g. zanzibar"
                            />
                            <button type="button" onClick={() => removeArrayItem('metaKeywords', idx)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X size={12}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-amber-600" size={18} />
                    <p className="text-xs font-bold text-amber-900">SEO Tip: Unique, descriptive titles and slugs perform better in ranking.</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#D1D5DB] flex items-center justify-between bg-slate-50">
          <p className="text-xs font-semibold text-[#1F2937] font-mono">Experience ID: {formData.id}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#1F2937] hover:text-[#111827] bg-slate-200 hover:bg-slate-300 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="tour-editor-form"
              className="px-8 py-2.5 rounded-xl bg-[#0B3B8C] hover:bg-[#082E6E] text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Save size={14} />
              Save Experience
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
