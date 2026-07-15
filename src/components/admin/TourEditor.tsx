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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B3B8C] text-[#D4A017] flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {tour.id ? 'Edit Experience' : 'Create New Experience'}
              </h3>
              <p className="text-xs text-slate-500">Configure global visibility, rich itinerary, and pricing for {formData.title || 'Untitled Experience'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex px-6 border-b border-slate-100 bg-white">
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
                className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'border-[#0B3B8C] text-[#0B3B8C] bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <form id="tour-editor-form" onSubmit={handleSubmit} className="space-y-8">
            
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tour Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0B3B8C] outline-none text-sm transition-all"
                        placeholder="e.g. Safari Blue Adventure"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">URL Slug (Auto-generated)</label>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                        <span className="text-xs text-slate-400">/tours/</span>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleChange}
                          className="w-full text-sm outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0B3B8C] outline-none text-sm transition-all appearance-none bg-white"
                      >
                        <option value="tour">Zanzibar Day Tour</option>
                        <option value="package">Holiday Package</option>
                        <option value="safari">Tanzania Safari</option>
                        <option value="kilimanjaro">Mount Kilimanjaro Trek</option>
                        <option value="transfer">Airport Transfer</option>
                        <option value="honeymoon">Honeymoon Special</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Price (e.g. $45)</label>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-[#0B3B8C] transition-all">
                          <DollarSign size={14} className="text-slate-400" />
                          <input
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full text-sm outline-none"
                            placeholder="$0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Duration (e.g. 5 hrs)</label>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-[#0B3B8C] transition-all">
                          <Clock size={14} className="text-slate-400" />
                          <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full text-sm outline-none"
                            placeholder="Full Day"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Featured Image URL</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-2 focus-within:border-[#0B3B8C] transition-all">
                        <ImageIcon size={14} className="text-slate-400" />
                        <input
                          type="text"
                          name="img"
                          value={formData.img}
                          onChange={handleChange}
                          className="w-full text-sm outline-none"
                          placeholder="https://..."
                        />
                      </div>
                      {formData.img && (
                        <img src={formData.img} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="Preview" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Location / Pickup Area</label>
                    <div className="px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-2 focus-within:border-[#0B3B8C] transition-all">
                      <MapPin size={14} className="text-slate-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full text-sm outline-none"
                        placeholder="e.g. Fumba Village"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${formData.visible ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setFormData(p => ({ ...p, visible: !p.visible }))}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.visible ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Publicly Visible</p>
                      <p className="text-[10px] text-slate-500">Show on website</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${formData.featured ? 'bg-amber-500' : 'bg-slate-300'}`} onClick={() => setFormData(p => ({ ...p, featured: !p.featured }))}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.featured ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Featured Tour</p>
                      <p className="text-[10px] text-slate-500">Highlight on Home</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${formData.archived ? 'bg-red-500' : 'bg-slate-300'}`} onClick={() => setFormData(p => ({ ...p, archived: !p.archived }))}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.archived ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Archived</p>
                      <p className="text-[10px] text-slate-500">Historical records only</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Short Teaser Description (Listing View) *</label>
                  <textarea
                    name="shortDesc"
                    value={formData.shortDesc}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0B3B8C] outline-none text-sm transition-all"
                    placeholder="Short catching phrase..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Long Narrative Description (Detail Page)</label>
                  <textarea
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0B3B8C] outline-none text-sm transition-all"
                    placeholder="Describe the full experience, history, and vibes..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Highlights */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Highlights</label>
                      <button type="button" onClick={() => addArrayItem('highlights')} className="text-[#0B3B8C] text-xs font-bold">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {formData.highlights?.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('highlights', idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-[#0B3B8C]"
                          />
                          <button type="button" onClick={() => removeArrayItem('highlights', idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">What's Included</label>
                      <button type="button" onClick={() => addArrayItem('included')} className="text-emerald-600 text-xs font-bold">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {formData.included?.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('included', idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-100 bg-emerald-50/30 text-xs outline-none focus:border-emerald-600"
                          />
                          <button type="button" onClick={() => removeArrayItem('included', idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Excluded */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">What's Excluded</label>
                      <button type="button" onClick={() => addArrayItem('excluded')} className="text-red-600 text-xs font-bold">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {formData.excluded?.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('excluded', idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-100 bg-red-50/30 text-xs outline-none focus:border-red-600"
                          />
                          <button type="button" onClick={() => removeArrayItem('excluded', idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
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
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Search Engine Optimization</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meta Title</label>
                      <input
                        type="text"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0B3B8C] outline-none text-sm transition-all"
                        placeholder="Page title for Google search"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meta Description</label>
                      <textarea
                        name="seoDescription"
                        value={formData.seoDescription}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0B3B8C] outline-none text-sm transition-all"
                        placeholder="Brief summary shown in search results..."
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keywords</label>
                        <button type="button" onClick={() => addArrayItem('metaKeywords')} className="text-[#0B3B8C] text-xs font-bold">+ Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.metaKeywords?.map((kw, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-white border border-slate-200 rounded-full pl-3 pr-2 py-1">
                            <input
                              type="text"
                              value={kw}
                              onChange={(e) => handleArrayChange('metaKeywords', idx, e.target.value)}
                              className="text-[10px] font-bold text-slate-600 outline-none w-24"
                            />
                            <button type="button" onClick={() => removeArrayItem('metaKeywords', idx)} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-amber-500" size={18} />
                    <p className="text-xs font-bold text-amber-800">SEO Tip: Unique, descriptive titles and slugs perform better in ranking.</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-[10px] text-slate-400 font-mono">Experience ID: {formData.id}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="tour-editor-form"
              className="px-8 py-2.5 rounded-xl bg-[#0B3B8C] hover:bg-[#082E6E] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
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
