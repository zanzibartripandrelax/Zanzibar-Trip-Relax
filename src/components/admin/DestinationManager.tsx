import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Eye, EyeOff, MapPin, 
  Settings, FileText, Image as ImageIcon, Sparkles, AlertCircle, 
  CheckCircle2, PlusCircle, Thermometer, Compass, Star, Link2, 
  HelpCircle, BarChart3, ChevronRight, Globe, Layers, BookOpen, Hotel
} from 'lucide-react';
import { 
  Destination, ActivityItem, TourItem, Region,
  saveSiteContent, getSiteContent, getHotels, saveHotels,
  getGoogleMapEmbedUrl, getYouTubeEmbedUrl, extractYouTubeId
} from '../../lib/cmsStore';
import { MediaSelector } from '../MediaManager';
import { getBlogPostsFromStorage, saveBlogPosts } from '../../pages/BlogDetail';

interface DestinationManagerProps {
  isReadOnly: boolean;
  onRefresh?: () => void;
}

export const DestinationManager: React.FC<DestinationManagerProps> = ({ isReadOnly, onRefresh }) => {
  // Load current dynamic state
  const [siteContent, setSiteContent] = useState(getSiteContent());
  const [destinations, setDestinations] = useState<Destination[]>(siteContent.destinations || []);
  const [activities, setActivities] = useState<ActivityItem[]>(siteContent.activities || []);
  const [tours, setTours] = useState<TourItem[]>(siteContent.tours || []);
  const [hotels, setHotels] = useState(getHotels());
  const [blogs, setBlogs] = useState<any[]>([]);
  const [regions, setRegions] = useState<Region[]>(siteContent.regions || []);
  const [attractions, setAttractions] = useState<any[]>(siteContent.attractions || []);

  // Sub-tab: 'destinations' | 'activities' | 'regions' | 'attractions'
  const [activeSubTab, setActiveSubTab] = useState<'destinations' | 'activities' | 'regions' | 'attractions'>('destinations');

  // Currently editing objects
  const [editDest, setEditDest] = useState<Partial<Destination> | null>(null);
  const [editAct, setEditAct] = useState<Partial<ActivityItem> | null>(null);
  const [editRegion, setEditRegion] = useState<Partial<Region> | null>(null);
  const [editAttraction, setEditAttraction] = useState<any | null>(null);

  // Editor Sub-tabs
  const [editorTab, setEditorTab] = useState<'basic' | 'content' | 'stats' | 'relations' | 'gallery' | 'seo'>('basic');

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Sync states
    const content = getSiteContent();
    setSiteContent(content);
    setDestinations(content.destinations || []);
    setActivities(content.activities || []);
    setTours(content.tours || []);
    setHotels(getHotels());
    setRegions(content.regions || []);
    setAttractions(content.attractions || []);

    try {
      const blogData = getBlogPostsFromStorage();
      const blogList = Object.keys(blogData).map(key => ({
        id: key,
        title: blogData[key].title || key,
        ...blogData[key]
      }));
      setBlogs(blogList);
    } catch (e) {
      console.warn("Failed to read blogs inside DestinationManager", e);
    }
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // --- DESTINATION CRUD ---

  const handleCreateDestination = () => {
    if (isReadOnly) return;
    const newId = 'dest-' + Math.floor(Math.random() * 100000);
    const newDest: Partial<Destination> = {
      id: '',
      name: '',
      region: 'northern',
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description: '',
      bestTime: 'Year-round',
      highlights: [],
      topAttractions: [],
      thingsToDo: [],
      beaches: [],
      nationalParks: [],
      localExperiences: [],
      travelTips: [],
      weatherTemp: '28°C / 82°F',
      weatherIcon: 'sun',
      gallery: [],
      videos: [],
      faqs: [],
      relatedRestaurants: [],
      nearbyAttractions: [],
      similarDestinations: [],
      stats: [
        { label: 'Area', value: '1,500 km²' },
        { label: 'Wildlife Species', value: 'Vast variety' }
      ],
      visible: true
    };
    setEditDest(newDest);
    setEditorTab('basic');
  };

  const handleEditDestination = (dest: Destination) => {
    setEditDest({ ...dest });
    setEditorTab('basic');
  };

  const handleDeleteDestination = (id: string) => {
    if (isReadOnly) return;
    if (!window.confirm("Are you sure you want to delete this destination? All related UI widgets will lose this link.")) return;

    const updated = destinations.filter(d => d.id !== id);
    const content = { ...siteContent, destinations: updated };
    saveSiteContent(content, 'Admin', `Deleted destination [id: ${id}]`);
    setDestinations(updated);
    setSiteContent(content);
    showSuccess("Destination deleted successfully.");
    if (onRefresh) onRefresh();
  };

  const handleSaveDestination = () => {
    if (isReadOnly || !editDest) return;
    if (!editDest.name) {
      showError("Destination name is required.");
      return;
    }

    // Assign ID if creating
    let finalId = editDest.id;
    if (!finalId) {
      finalId = editDest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      // Ensure unique
      if (destinations.some(d => d.id === finalId)) {
        finalId = `${finalId}-${Math.floor(Math.random() * 1000)}`;
      }
      editDest.id = finalId;
    }

    // Default values
    const fullDest: Destination = {
      id: finalId,
      name: editDest.name,
      region: editDest.region || 'northern',
      image: editDest.image || 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
      videoUrl: editDest.videoUrl || '',
      description: editDest.description || '',
      history: editDest.history || '',
      culture: editDest.culture || '',
      wildlife: editDest.wildlife || '',
      marineLife: editDest.marineLife || '',
      geography: editDest.geography || '',
      climate: editDest.climate || '',
      bestTime: editDest.bestTime || 'Year-round',
      whyVisit: editDest.whyVisit || '',
      highlights: editDest.highlights || [],
      topAttractions: editDest.topAttractions || [],
      thingsToDo: editDest.thingsToDo || [],
      beaches: editDest.beaches || [],
      nationalParks: editDest.nationalParks || [],
      localExperiences: editDest.localExperiences || [],
      travelTips: editDest.travelTips || [],
      weatherTemp: editDest.weatherTemp || '28°C / 82°F',
      weatherIcon: editDest.weatherIcon || 'sun',
      mapUrl: editDest.mapUrl || '',
      gallery: editDest.gallery || [],
      videos: editDest.videos || [],
      faqs: editDest.faqs || [],
      relatedRestaurants: editDest.relatedRestaurants || [],
      nearbyAttractions: editDest.nearbyAttractions || [],
      similarDestinations: editDest.similarDestinations || [],
      travelGuide: editDest.travelGuide || '',
      seoTitle: editDest.seoTitle || `${editDest.name} Travel Guide | Zanzibar Trip & Relax`,
      seoDescription: editDest.seoDescription || editDest.description || '',
      metaKeywords: editDest.metaKeywords || [editDest.name, 'Tanzania travel'],
      stats: editDest.stats || [],
      visible: editDest.visible ?? true,
      archived: editDest.archived ?? false
    };

    // Update package/tour references from checkboxes on Save
    // We check which tours are selected for this destination and update their destinationIds
    const updatedTours = tours.map(t => {
      const isSelected = selectedTourIds.includes(t.id);
      const destIds = t.destinationIds || [];
      if (isSelected && !destIds.includes(finalId!)) {
        return { ...t, destinationIds: [...destIds, finalId!] };
      } else if (!isSelected && destIds.includes(finalId!)) {
        return { ...t, destinationIds: destIds.filter(id => id !== finalId) };
      }
      return t;
    });

    const updatedDestinations = destinations.some(d => d.id === finalId)
      ? destinations.map(d => d.id === finalId ? fullDest : d)
      : [...destinations, fullDest];

    const content = { 
      ...siteContent, 
      destinations: updatedDestinations,
      tours: updatedTours
    };
    
    saveSiteContent(content, 'Admin', `Saved destination [${fullDest.name}]`);
    setDestinations(updatedDestinations);
    setTours(updatedTours);
    setSiteContent(content);
    setEditDest(null);
    showSuccess(`Destination "${fullDest.name}" saved successfully.`);
    if (onRefresh) onRefresh();
  };

  // --- ACTIVITIES CRUD ---

  const handleCreateActivity = () => {
    if (isReadOnly) return;
    const newAct: Partial<ActivityItem> = {
      id: 'act-' + Math.floor(Math.random() * 10000),
      name: '',
      description: '',
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      destinationIds: [],
      tags: []
    };
    setEditAct(newAct);
  };

  const handleEditActivity = (act: ActivityItem) => {
    setEditAct({ ...act });
  };

  const handleDeleteActivity = (id: string) => {
    if (isReadOnly) return;
    if (!window.confirm("Are you sure you want to delete this activity?")) return;

    const updated = activities.filter(a => a.id !== id);
    const content = { ...siteContent, activities: updated };
    saveSiteContent(content, 'Admin', `Deleted activity [id: ${id}]`);
    setActivities(updated);
    setSiteContent(content);
    showSuccess("Activity deleted successfully.");
    if (onRefresh) onRefresh();
  };

  const handleSaveActivity = () => {
    if (isReadOnly || !editAct) return;
    if (!editAct.name) {
      showError("Activity name is required.");
      return;
    }

    const fullAct: ActivityItem = {
      id: editAct.id || 'act-' + Math.floor(Math.random() * 10000),
      name: editAct.name,
      description: editAct.description || '',
      image: editAct.image || 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      destinationIds: editAct.destinationIds || [],
      tags: editAct.tags || []
    };

    const updatedActivities = activities.some(a => a.id === fullAct.id)
      ? activities.map(a => a.id === fullAct.id ? fullAct : a)
      : [...activities, fullAct];

    const content = { ...siteContent, activities: updatedActivities };
    saveSiteContent(content, 'Admin', `Saved activity [${fullAct.name}]`);
    setActivities(updatedActivities);
    setSiteContent(content);
    setEditAct(null);
    showSuccess(`Activity "${fullAct.name}" saved successfully.`);
    if (onRefresh) onRefresh();
  };

  // --- ATTRACTIONS CRUD ---
  const handleCreateAttraction = () => {
    if (isReadOnly) return;
    const newAtt = {
      id: 'att-' + Math.floor(Math.random() * 10000),
      destinationId: destinations[0]?.id || 'unguja',
      name: '',
      image: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
      description: '',
      location: '',
      mapUrl: '',
      thingsToDo: [] as string[],
      relatedTours: [] as string[]
    };
    setEditAttraction(newAtt);
  };

  const handleEditAttraction = (att: any) => {
    setEditAttraction({ ...att });
  };

  const handleDeleteAttraction = (id: string) => {
    if (isReadOnly) return;
    if (!window.confirm("Are you sure you want to delete this attraction?")) return;

    const updated = attractions.filter(a => a.id !== id);
    const content = { ...siteContent, attractions: updated };
    saveSiteContent(content, 'Admin', `Deleted attraction [id: ${id}]`);
    setAttractions(updated);
    setSiteContent(content);
    showSuccess("Attraction deleted successfully.");
    if (onRefresh) onRefresh();
  };

  const handleSaveAttraction = () => {
    if (isReadOnly || !editAttraction) return;
    if (!editAttraction.name) {
      showError("Attraction name is required.");
      return;
    }

    const fullAtt = {
      id: editAttraction.id || 'att-' + Math.floor(Math.random() * 10000),
      destinationId: editAttraction.destinationId || 'unguja',
      name: editAttraction.name,
      image: editAttraction.image || 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
      description: editAttraction.description || '',
      location: editAttraction.location || '',
      mapUrl: editAttraction.mapUrl || '',
      thingsToDo: editAttraction.thingsToDo || [],
      relatedTours: editAttraction.relatedTours || []
    };

    const updatedAttractions = attractions.some(a => a.id === fullAtt.id)
      ? attractions.map(a => a.id === fullAtt.id ? fullAtt : a)
      : [...attractions, fullAtt];

    const content = { ...siteContent, attractions: updatedAttractions };
    saveSiteContent(content, 'Admin', `Saved attraction [${fullAtt.name}]`);
    setAttractions(updatedAttractions);
    setSiteContent(content);
    setEditAttraction(null);
    showSuccess(`Attraction "${fullAtt.name}" saved successfully.`);
    if (onRefresh) onRefresh();
  };

  // --- RELATIONSHIPS STATES ---
  // Tracks selected packages/tours for the currently editing destination
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (editDest && editDest.id) {
      const related = tours
        .filter(t => t.destinationIds && t.destinationIds.includes(editDest.id!))
        .map(t => t.id);
      setSelectedTourIds(related);
    } else {
      setSelectedTourIds([]);
    }
  }, [editDest]);

  const toggleTourRelation = (tourId: string) => {
    setSelectedTourIds(prev => 
      prev.includes(tourId) ? prev.filter(id => id !== tourId) : [...prev, tourId]
    );
  };

  // --- HELPER DYNAMIC LIST INPUTS ---

  const handleAddStringItem = (field: 'highlights' | 'topAttractions' | 'thingsToDo' | 'beaches' | 'nationalParks' | 'localExperiences' | 'travelTips' | 'relatedRestaurants' | 'nearbyAttractions' | 'gallery') => {
    if (!editDest) return;
    const current = editDest[field] || [];
    setEditDest({
      ...editDest,
      [field]: [...current, '']
    });
  };

  const handleEditStringItem = (field: 'highlights' | 'topAttractions' | 'thingsToDo' | 'beaches' | 'nationalParks' | 'localExperiences' | 'travelTips' | 'relatedRestaurants' | 'nearbyAttractions' | 'gallery', index: number, value: string) => {
    if (!editDest) return;
    const current = [...(editDest[field] || [])];
    current[index] = value;
    setEditDest({
      ...editDest,
      [field]: current
    });
  };

  const handleRemoveStringItem = (field: 'highlights' | 'topAttractions' | 'thingsToDo' | 'beaches' | 'nationalParks' | 'localExperiences' | 'travelTips' | 'relatedRestaurants' | 'nearbyAttractions' | 'gallery', index: number) => {
    if (!editDest) return;
    const current = (editDest[field] || []).filter((_, i) => i !== index);
    setEditDest({
      ...editDest,
      [field]: current
    });
  };

  // --- FAQ INPUTS ---

  const handleAddFaq = () => {
    if (!editDest) return;
    const faqs = editDest.faqs || [];
    setEditDest({
      ...editDest,
      faqs: [...faqs, { q: '', a: '' }]
    });
  };

  const handleEditFaq = (index: number, key: 'q' | 'a', value: string) => {
    if (!editDest) return;
    const faqs = [...(editDest.faqs || [])];
    faqs[index] = { ...faqs[index], [key]: value };
    setEditDest({
      ...editDest,
      faqs
    });
  };

  const handleRemoveFaq = (index: number) => {
    if (!editDest) return;
    const faqs = (editDest.faqs || []).filter((_, i) => i !== index);
    setEditDest({
      ...editDest,
      faqs
    });
  };

  // --- STATS INPUTS ---

  const handleAddStat = () => {
    if (!editDest) return;
    const stats = editDest.stats || [];
    setEditDest({
      ...editDest,
      stats: [...stats, { label: 'Metric', value: 'Value' }]
    });
  };

  const handleEditStat = (index: number, key: 'label' | 'value', value: string) => {
    if (!editDest) return;
    const stats = [...(editDest.stats || [])];
    stats[index] = { ...stats[index], [key]: value };
    setEditDest({
      ...editDest,
      stats
    });
  };

  const handleRemoveStat = (index: number) => {
    if (!editDest) return;
    const stats = (editDest.stats || []).filter((_, i) => i !== index);
    setEditDest({
      ...editDest,
      stats
    });
  };

  // --- BLOG LINKING ---
  const toggleBlogRelation = (blogSlug: string) => {
    if (!editDest) return;
    const currentKeywords = editDest.metaKeywords || [];
    // Or we can map keywords to easily find blogs. Or better: we can store `relatedBlogs` inside the destinations!
    // Wait, let's just make sure we save keyword-based tags or explicit blog links!
    // Storing tags/keywords is super easy. Let's let the destination keep a similar array for blog linking.
    // Since we want robust linkings, let's store similar dest tags in blog, or save blog's meta tags.
    // Even easier: we can update the blog post itself!
    // Let's update the blog post's `destinationId` property if we check it!
    const updatedBlogs = { ...getBlogPostsFromStorage() };
    const blog = updatedBlogs[blogSlug];
    if (blog) {
      const destIds = blog.destinationIds || [];
      if (destIds.includes(editDest.id!)) {
        blog.destinationIds = destIds.filter((id: string) => id !== editDest.id);
      } else {
        blog.destinationIds = [...destIds, editDest.id!];
      }
      saveBlogPosts(updatedBlogs);
      setBlogs(Object.keys(updatedBlogs).map(k => ({ id: k, title: updatedBlogs[k].title || k, ...updatedBlogs[k] })));
      showSuccess(`Updated blog relation for "${blog.title}".`);
    }
  };

  // --- HOTEL LINKING ---
  const toggleHotelRelation = (hotelId: string) => {
    if (!editDest) return;
    // We can update the hotel in cmsStore to belong to this destinationId
    const updatedHotels = hotels.map(h => {
      if (h.id === hotelId) {
        return { ...h, destinationId: h.destinationId === editDest.id ? '' : editDest.id };
      }
      return h;
    });
    saveHotels(updatedHotels);
    setHotels(updatedHotels);
    showSuccess("Hotel relationship updated.");
  };

  return (
    <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 text-slate-100 space-y-6">
      
      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Mode Toggle Buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => { setActiveSubTab('destinations'); setEditDest(null); setEditAct(null); setEditRegion(null); setEditAttraction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'destinations' ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass size={14} />
          <span>Destinations Directory ({destinations.length})</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('activities'); setEditDest(null); setEditAct(null); setEditRegion(null); setEditAttraction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'activities' ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={14} />
          <span>Activities Module ({activities.length})</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('regions'); setEditDest(null); setEditAct(null); setEditRegion(null); setEditAttraction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'regions' ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe size={14} />
          <span>Regions/Categories ({regions.length})</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('attractions'); setEditDest(null); setEditAct(null); setEditRegion(null); setEditAttraction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'attractions' ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={14} className="text-[#D4A017]" />
          <span>Attractions ({attractions.length})</span>
        </button>
      </div>

      {/* ==========================================
          DESTINATIONS TAB VIEW
          ========================================== */}
      {activeSubTab === 'destinations' && !editDest && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Manage Zanzibar & Tanzania Destinations</h3>
              <p className="text-[10px] text-slate-400">Create landing pages, assign statistics, link packages, hotels, and blogs.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={handleCreateDestination}
                className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#D4A017]/10"
              >
                <Plus size={14} />
                <span>Add Destination</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map(d => {
              const regionNames = {
                northern: 'Northern Tanzania',
                southern: 'Southern Tanzania',
                western: 'Western Tanzania',
                zanzibar: 'Zanzibar Archipelago'
              };
              
              // Count relationships
              const relatedToursCount = tours.filter(t => t.destinationIds && t.destinationIds.includes(d.id)).length;
              const relatedHotelsCount = hotels.filter(h => h.destinationId === d.id).length;
              const relatedBlogsCount = blogs.filter(b => b.destinationIds && b.destinationIds.includes(d.id)).length;

              return (
                <div key={d.id} className="bg-[#121B30] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4A017]/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative h-32 w-full">
                      <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121B30] to-transparent" />
                      <span className="absolute top-2 left-2 bg-black/60 text-[8px] font-extrabold text-[#D4A017] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {regionNames[d.region] || d.region}
                      </span>
                      {d.visible === false && (
                        <span className="absolute top-2 right-2 bg-rose-500/80 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          Draft / Archived
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#D4A017]" />
                        <span>{d.name}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{d.description}</p>
                      
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 text-[9px] text-slate-300">
                        <span className="bg-slate-950 px-2 py-1 rounded">📦 {relatedToursCount} Packages</span>
                        <span className="bg-slate-950 px-2 py-1 rounded">🏨 {relatedHotelsCount} Hotels</span>
                        <span className="bg-slate-950 px-2 py-1 rounded">📝 {relatedBlogsCount} Blogs</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/5 bg-slate-950/20 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleEditDestination(d)}
                      className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 p-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={12} />
                      <span>Edit & Link</span>
                    </button>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleDeleteDestination(d.id)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          DESTINATIONS EDIT VIEW
          ========================================== */}
      {activeSubTab === 'destinations' && editDest && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
            <div>
              <button 
                onClick={() => setEditDest(null)} 
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-1 cursor-pointer"
              >
                <ChevronRight size={12} className="rotate-180" />
                <span>Back to Directory</span>
              </button>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{editDest.id ? 'Edit Destination:' : 'Create New Destination'}</span>
                <span className="text-[#D4A017]">{editDest.name || 'Untitled'}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditDest(null)}
                className="bg-[#121B30] hover:bg-slate-800 text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDestination}
                className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Editor Tabs Row */}
          <div className="flex flex-wrap items-center gap-1 border-b border-white/5 pb-2">
            {[
              { id: 'basic', label: 'Basic Info & Hero', icon: Settings },
              { id: 'content', label: 'Overview & Highlights', icon: FileText },
              { id: 'stats', label: 'Custom Statistics', icon: BarChart3 },
              { id: 'relations', label: 'Dynamic Relations', icon: Link2 },
              { id: 'gallery', label: 'Gallery & FAQs', icon: HelpCircle },
              { id: 'seo', label: 'SEO Settings', icon: Globe }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setEditorTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editorTab === tab.id ? 'bg-[#0B3B8C] text-white' : 'bg-[#121B30]/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: BASIC INFO */}
          {editorTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Destination Name *</label>
                  <input
                    type="text"
                    value={editDest.name || ''}
                    onChange={e => setEditDest({ ...editDest, name: e.target.value })}
                    placeholder="e.g. Serengeti National Park"
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Geographic Region Category *</label>
                  <select
                    value={editDest.region || 'northern'}
                    onChange={e => setEditDest({ ...editDest, region: e.target.value as any })}
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  >
                    <option value="northern">Northern Tanzania Safari Circuit</option>
                    <option value="southern">Southern Tanzania Safari Circuit</option>
                    <option value="western">Western Tanzania Wilderness Circuit</option>
                    <option value="zanzibar">Zanzibar Island & Archipelago</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Best Time To Visit (Quick Note)</label>
                  <input
                    type="text"
                    value={editDest.bestTime || ''}
                    onChange={e => setEditDest({ ...editDest, bestTime: e.target.value })}
                    placeholder="e.g. Late June to October"
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Avg Weather Temp</label>
                    <input
                      type="text"
                      value={editDest.weatherTemp || ''}
                      onChange={e => setEditDest({ ...editDest, weatherTemp: e.target.value })}
                      placeholder="e.g. 27°C / 81°F"
                      className="w-full bg-[#121B30] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Weather Icon</label>
                    <select
                      value={editDest.weatherIcon || 'sun'}
                      onChange={e => setEditDest({ ...editDest, weatherIcon: e.target.value as any })}
                      className="w-full bg-[#121B30] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                    >
                      <option value="sun">Sunny / Clear</option>
                      <option value="cloud">Cloudy</option>
                      <option value="cloud-rain">Rainy / Tropical Monsoons</option>
                      <option value="wind">Windy / High Altitudes</option>
                      <option value="thermometer">Hot / Semi-arid</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Google Maps Link or Location Name</label>
                  <input
                    type="text"
                    value={editDest.mapUrl || ''}
                    onChange={e => setEditDest({ ...editDest, mapUrl: e.target.value })}
                    placeholder="Paste Google Maps URL, share link, or location name (e.g. Stone Town, Zanzibar)"
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Paste any Google Maps share link. The system will extract location coordinates and generate the interactive map frame automatically.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <MediaSelector
                    label="Hero Featured Image"
                    value={editDest.image || ''}
                    onChange={url => setEditDest({ ...editDest, image: url })}
                    folder="destinations"
                    isCMSReadOnly={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hero Video URL (YouTube)</label>
                  <input
                    type="text"
                    value={editDest.videoUrl || ''}
                    onChange={e => setEditDest({ ...editDest, videoUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=aD77-k1tZxs or https://youtu.be/aD77-k1tZxs"
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
                <div className="bg-[#121B30] border border-white/5 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Landing Page Visibility</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editDest.visible !== false}
                        onChange={e => setEditDest({ ...editDest, visible: e.target.checked })}
                        className="rounded bg-[#0A1224] border-white/10 text-[#D4A017] focus:ring-[#D4A017]"
                      />
                      <span>Visible to Public Website visitors</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED SECTIONS */}
          {editorTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Overview Description *</label>
                <textarea
                  value={editDest.description || ''}
                  onChange={e => setEditDest({ ...editDest, description: e.target.value })}
                  placeholder="Main introductory overview of this tourist destination..."
                  rows={4}
                  className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Historical Heritage</label>
                  <textarea
                    value={editDest.history || ''}
                    onChange={e => setEditDest({ ...editDest, history: e.target.value })}
                    placeholder="Rich historical insights of the region..."
                    rows={3}
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Local Culture & People</label>
                  <textarea
                    value={editDest.culture || ''}
                    onChange={e => setEditDest({ ...editDest, culture: e.target.value })}
                    placeholder="Cultural etiquettes, Maasai bomas, or Swahili heritage..."
                    rows={3}
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Wildlife & Nature plains</label>
                  <textarea
                    value={editDest.wildlife || ''}
                    onChange={e => setEditDest({ ...editDest, wildlife: e.target.value })}
                    placeholder="Big Five densities, migration pathways, birdlife..."
                    rows={3}
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Marine Life & Reefs (Zanzibar context)</label>
                  <textarea
                    value={editDest.marineLife || ''}
                    onChange={e => setEditDest({ ...editDest, marineLife: e.target.value })}
                    placeholder="Corals, wild dolphins, sea turtles, whale sharks..."
                    rows={3}
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Geography & Terrains</label>
                  <textarea
                    value={editDest.geography || ''}
                    onChange={e => setEditDest({ ...editDest, geography: e.target.value })}
                    placeholder="Calderas, salt flats, mountains, or sandy lagoons..."
                    rows={3}
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Travel Guide Book (Full Text)</label>
                  <textarea
                    value={editDest.travelGuide || ''}
                    onChange={e => setEditDest({ ...editDest, travelGuide: e.target.value })}
                    placeholder="A comprehensive guidebook detailing logistics, visa requirements, park rules..."
                    rows={3}
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
              </div>

              {/* Dynamic String Lists (Highlights, Travel Tips) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/25 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Key Highlights / Features</span>
                    <button type="button" onClick={() => handleAddStringItem('highlights')} className="text-[#D4A017] hover:text-white text-xs flex items-center gap-1 cursor-pointer">
                      <PlusCircle size={12} /> Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(editDest.highlights || []).map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={e => handleEditStringItem('highlights', index, e.target.value)}
                          placeholder="e.g. Serengeti Great Migration Crossing"
                          className="w-full bg-[#121B30] border border-white/5 p-1.5 rounded-lg text-[11px] outline-none"
                        />
                        <button type="button" onClick={() => handleRemoveStringItem('highlights', index)} className="text-rose-400 hover:text-rose-200">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/25 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Travel & Logistics Tips</span>
                    <button type="button" onClick={() => handleAddStringItem('travelTips')} className="text-[#D4A017] hover:text-white text-xs flex items-center gap-1 cursor-pointer">
                      <PlusCircle size={12} /> Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(editDest.travelTips || []).map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={e => handleEditStringItem('travelTips', index, e.target.value)}
                          placeholder="e.g. Pack warm jackets for Ngorongoro rims"
                          className="w-full bg-[#121B30] border border-white/5 p-1.5 rounded-lg text-[11px] outline-none"
                        />
                        <button type="button" onClick={() => handleRemoveStringItem('travelTips', index)} className="text-rose-400 hover:text-rose-200">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATISTICS */}
          {editorTab === 'stats' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Key Statistics & Metrics</span>
                  <p className="text-[10px] text-slate-400">Add customizable metric boxes that display on the landing page (e.g., Area, Wildlife species, UNESCO status, Annual visitors, Beaches).</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStat}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle size={12} />
                  <span>Add Metric</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
                {(editDest.stats || []).map((stat, index) => (
                  <div key={index} className="bg-[#121B30] border border-white/5 p-3 rounded-xl flex gap-3 items-end">
                    <div className="flex-grow space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase">Label / Stat Title</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={e => handleEditStat(index, 'label', e.target.value)}
                        placeholder="e.g. Big Five"
                        className="w-full bg-[#0A1224] border border-white/5 p-1.5 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div className="flex-grow space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase">Stat Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={e => handleEditStat(index, 'value', e.target.value)}
                        placeholder="e.g. All 5 Present"
                        className="w-full bg-[#0A1224] border border-white/5 p-1.5 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(index)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2.5 rounded-lg mb-0.5 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RELATIONSHIPS */}
          {editorTab === 'relations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Related Packages List */}
              <div className="bg-slate-950/25 p-4 rounded-2xl space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-[#D4A017] flex items-center gap-1.5">
                    <Compass size={14} />
                    <span>Tours & Packages ({tours.length})</span>
                  </h4>
                  <p className="text-[9px] text-slate-400">Select packages that are automatically grouped under this destination.</p>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {tours.map(t => {
                    const isRelated = selectedTourIds.includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center gap-2 bg-[#121B30] hover:bg-[#15203b] p-2 rounded-xl text-[10px] font-medium text-slate-300 cursor-pointer border border-white/5">
                        <input
                          type="checkbox"
                          checked={isRelated}
                          onChange={() => toggleTourRelation(t.id)}
                          className="rounded bg-[#0A1224] border-white/10 text-[#D4A017] focus:ring-[#D4A017]"
                        />
                        <span>{t.title} <span className="text-slate-500 capitalize">({t.category})</span></span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Related Hotels List */}
              <div className="bg-slate-950/25 p-4 rounded-2xl space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-[#D4A017] flex items-center gap-1.5">
                    <Hotel size={14} />
                    <span>Hotels & Lodges ({hotels.length})</span>
                  </h4>
                  <p className="text-[9px] text-slate-400">Link lodging choices to show up when viewing this landing page.</p>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {hotels.map(h => {
                    const isRelated = h.destinationId === editDest.id;
                    return (
                      <label key={h.id} className="flex items-center gap-2 bg-[#121B30] hover:bg-[#15203b] p-2 rounded-xl text-[10px] font-medium text-slate-300 cursor-pointer border border-white/5">
                        <input
                          type="checkbox"
                          checked={isRelated}
                          onChange={() => toggleHotelRelation(h.id)}
                          className="rounded bg-[#0A1224] border-white/10 text-[#D4A017] focus:ring-[#D4A017]"
                        />
                        <span>{h.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Related Blogs List */}
              <div className="bg-slate-950/25 p-4 rounded-2xl space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-[#D4A017] flex items-center gap-1.5">
                    <BookOpen size={14} />
                    <span>Blog Articles ({blogs.length})</span>
                  </h4>
                  <p className="text-[9px] text-slate-400">Link specific travel guides and advice to this destination page.</p>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {blogs.map(b => {
                    const isRelated = b.destinationIds && b.destinationIds.includes(editDest.id!);
                    return (
                      <label key={b.id} className="flex items-center gap-2 bg-[#121B30] hover:bg-[#15203b] p-2 rounded-xl text-[10px] font-medium text-slate-300 cursor-pointer border border-white/5">
                        <input
                          type="checkbox"
                          checked={isRelated || false}
                          onChange={() => toggleBlogRelation(b.id)}
                          className="rounded bg-[#0A1224] border-white/10 text-[#D4A017] focus:ring-[#D4A017]"
                        />
                        <span>{b.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY & FAQS */}
          {editorTab === 'gallery' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Gallery Image URLs */}
              <div className="bg-slate-950/25 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gallery Photo URLs</span>
                  <button type="button" onClick={() => handleAddStringItem('gallery')} className="text-[#D4A017] hover:text-white text-xs flex items-center gap-1 cursor-pointer">
                    <PlusCircle size={12} /> Add Photo
                  </button>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {(editDest.gallery || []).map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item}
                        onChange={e => handleEditStringItem('gallery', index, e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-[#121B30] border border-white/5 p-1.5 rounded-lg text-[11px] outline-none"
                      />
                      {item && (
                        <img src={item} alt="Preview" className="w-8 h-8 rounded object-cover border border-white/5" />
                      )}
                      <button type="button" onClick={() => handleRemoveStringItem('gallery', index)} className="text-rose-400 hover:text-rose-200">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Destination FAQs */}
              <div className="bg-slate-950/25 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Specific FAQs</span>
                  <button type="button" onClick={handleAddFaq} className="text-[#D4A017] hover:text-white text-xs flex items-center gap-1 cursor-pointer">
                    <PlusCircle size={12} /> Add FAQ
                  </button>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {(editDest.faqs || []).map((faq, index) => (
                    <div key={index} className="bg-[#121B30] p-3 rounded-xl border border-white/5 space-y-1.5 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="absolute top-2 right-2 text-rose-400 hover:text-rose-200"
                      >
                        <X size={12} />
                      </button>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={e => handleEditFaq(index, 'q', e.target.value)}
                        placeholder="Enter Question..."
                        className="w-11/12 bg-[#0A1224] border border-white/5 p-1.5 rounded-lg text-[10px] outline-none"
                      />
                      <textarea
                        value={faq.a}
                        onChange={e => handleEditFaq(index, 'a', e.target.value)}
                        placeholder="Enter Answer..."
                        rows={2}
                        className="w-full bg-[#0A1224] border border-white/5 p-1.5 rounded-lg text-[10px] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SEO */}
          {editorTab === 'seo' && (
            <div className="bg-slate-950/25 p-4 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Meta Search Engine Optimization</span>
                <p className="text-[10px] text-slate-400">Configure canonical metadata for SEO optimization, allowing search bots to index the page correctly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={editDest.seoTitle || ''}
                      onChange={e => setEditDest({ ...editDest, seoTitle: e.target.value })}
                      placeholder="e.g. Serengeti Safari & Great Migration | Zanzibar Trip & Relax"
                      className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={(editDest.metaKeywords || []).join(', ')}
                      onChange={e => setEditDest({ ...editDest, metaKeywords: e.target.value.split(',').map(s => s.trim()) })}
                      placeholder="Serengeti National Park, Safari from Zanzibar, Migration"
                      className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SEO Meta Description</label>
                  <textarea
                    value={editDest.seoDescription || ''}
                    onChange={e => setEditDest({ ...editDest, seoDescription: e.target.value })}
                    placeholder="Brief 150-160 character meta snippet for search results..."
                    rows={4}
                    className="w-full bg-[#121B30] border border-white/5 p-2.5 rounded-xl text-xs focus:border-[#D4A017] outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          ACTIVITIES DIRECTORY TAB VIEW
          ========================================== */}
      {activeSubTab === 'activities' && !editAct && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Activities & Excursions module</h3>
              <p className="text-[10px] text-slate-400">Add excursion activities and assign them to one or multiple destinations across Tanzania.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={handleCreateActivity}
                className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#D4A017]/10"
              >
                <Plus size={14} />
                <span>Add Activity</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map(a => (
              <div key={a.id} className="bg-[#121B30] border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-[#D4A017]/30 transition-all items-start">
                <img src={a.image} alt={a.name} className="w-16 h-16 rounded-xl object-cover border border-white/5" />
                <div className="flex-grow space-y-1">
                  <h4 className="font-bold text-xs text-white flex items-center justify-between">
                    <span>{a.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditActivity(a)}
                        className="text-blue-400 hover:text-white p-1 rounded hover:bg-slate-800"
                      >
                        <Edit size={10} />
                      </button>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleDeleteActivity(a.id)}
                          className="text-rose-400 hover:text-rose-200 p-1 rounded hover:bg-slate-800"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </h4>
                  <p className="text-[10px] text-slate-400">{a.description}</p>
                  
                  {/* Linked destinations tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {a.destinationIds && a.destinationIds.length > 0 ? (
                      a.destinationIds.map(destId => {
                        const name = destinations.find(d => d.id === destId)?.name || destId;
                        return (
                          <span key={destId} className="bg-slate-950 text-slate-300 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/5">
                            <MapPin size={6} className="text-[#D4A017]" />
                            <span>{name}</span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[8px] text-rose-400 italic">No linked destinations</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          ACTIVITIES EDIT VIEW
          ========================================== */}
      {activeSubTab === 'activities' && editAct && (
        <div className="space-y-4 max-w-xl">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h4 className="font-bold text-xs text-white">{editAct.id ? 'Edit Activity Details' : 'Create New Activity'}</h4>
            <button onClick={() => setEditAct(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Activity Name *</label>
              <input
                type="text"
                value={editAct.name || ''}
                onChange={e => setEditAct({ ...editAct, name: e.target.value })}
                placeholder="e.g. Scuba Diving"
                className="w-full bg-[#121B30] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Activity Image URL</label>
              <input
                type="text"
                value={editAct.image || ''}
                onChange={e => setEditAct({ ...editAct, image: e.target.value })}
                placeholder="https://images.pexels.com/..."
                className="w-full bg-[#121B30] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
              <textarea
                value={editAct.description || ''}
                onChange={e => setEditAct({ ...editAct, description: e.target.value })}
                placeholder="Brief summary of the activity..."
                rows={3}
                className="w-full bg-[#121B30] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none"
              />
            </div>

            {/* Link destinations checkboxes */}
            <div className="space-y-2 bg-slate-950/25 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Linked Destinations</span>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {destinations.map(d => {
                  const isLinked = (editAct.destinationIds || []).includes(d.id);
                  return (
                    <label key={d.id} className="flex items-center gap-2 bg-[#121B30] hover:bg-[#15203b] p-1.5 rounded-lg text-[10px] font-medium text-slate-300 cursor-pointer border border-white/5">
                      <input
                        type="checkbox"
                        checked={isLinked}
                        onChange={() => {
                          const currentIds = editAct.destinationIds || [];
                          const updated = isLinked 
                            ? currentIds.filter(id => id !== d.id)
                            : [...currentIds, d.id];
                          setEditAct({ ...editAct, destinationIds: updated });
                        }}
                        className="rounded bg-[#0A1224] border-white/10 text-[#D4A017] focus:ring-[#D4A017]"
                      />
                      <span>{d.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setEditAct(null)}
                className="bg-[#121B30] hover:bg-slate-800 text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActivity}
                className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>Save Activity</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ATTRACTIONS TAB VIEW
          ========================================== */}
      {activeSubTab === 'attractions' && !editAttraction && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Manage Popular Attractions</h3>
              <p className="text-[10px] text-slate-400">Add, edit, or remove major attractions displayed dynamically on destination pages.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={handleCreateAttraction}
                className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Attraction</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attractions.map(attr => {
              const destName = destinations.find(d => d.id === attr.destinationId)?.name || attr.destinationId;
              return (
                <div key={attr.id} className="bg-[#121B30] border border-white/5 rounded-2xl overflow-hidden flex flex-col group hover:border-[#D4A017]/20 transition-all">
                  <div className="h-32 w-full relative bg-slate-900">
                    <img src={attr.image} alt={attr.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-[9px] px-2 py-1 rounded-md font-bold text-[#D4A017] border border-white/5 uppercase">
                      {destName}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#D4A017]" />
                        <span>{attr.name}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">{attr.location}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed mt-1">{attr.description}</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleEditAttraction(attr)}
                        className="bg-[#1a2642] hover:bg-[#25365e] text-slate-300 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit size={12} />
                        <span className="text-[10px]">Edit</span>
                      </button>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleDeleteAttraction(attr.id)}
                          className="bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 size={12} />
                          <span className="text-[10px]">Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {attractions.length === 0 && (
            <div className="text-center py-12 bg-[#121B30] rounded-3xl border border-white/5">
              <Sparkles className="mx-auto text-slate-500 mb-2" size={24} />
              <p className="text-xs text-slate-400">No attractions found. Create one above to get started!</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'attractions' && editAttraction && (
        <div className="bg-[#121B30] border border-white/5 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <div>
              <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                <Sparkles size={14} className="text-[#D4A017]" />
                <span>{editAttraction.name ? `Edit: ${editAttraction.name}` : 'Create New Attraction'}</span>
              </h4>
              <p className="text-[9px] text-slate-400">Specify attraction details, location, and link it to its parent destination.</p>
            </div>
            <button
              onClick={() => setEditAttraction(null)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Attraction Name *</label>
                <input
                  type="text"
                  value={editAttraction.name || ''}
                  onChange={e => setEditAttraction({ ...editAttraction, name: e.target.value })}
                  placeholder="e.g. Stone Town"
                  className="w-full bg-[#0A1224] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Parent Destination *</label>
                <select
                  value={editAttraction.destinationId || ''}
                  onChange={e => setEditAttraction({ ...editAttraction, destinationId: e.target.value })}
                  className="w-full bg-[#0A1224] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white cursor-pointer"
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Specific Location</label>
                <input
                  type="text"
                  value={editAttraction.location || ''}
                  onChange={e => setEditAttraction({ ...editAttraction, location: e.target.value })}
                  placeholder="e.g. Zanzibar Town, Unguja"
                  className="w-full bg-[#0A1224] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={editAttraction.image || ''}
                  onChange={e => setEditAttraction({ ...editAttraction, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#0A1224] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Google Maps Embed URL</label>
                <input
                  type="text"
                  value={editAttraction.mapUrl || ''}
                  onChange={e => setEditAttraction({ ...editAttraction, mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/maps?q=..."
                  className="w-full bg-[#0A1224] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Attraction Description</label>
                <textarea
                  value={editAttraction.description || ''}
                  onChange={e => setEditAttraction({ ...editAttraction, description: e.target.value })}
                  placeholder="Brief summary of the history, sights, and significance of this attraction..."
                  rows={4}
                  className="w-full bg-[#0A1224] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Things to Do (One per line)</label>
                <textarea
                  value={editAttraction.thingsToDo?.join('\n') || ''}
                  onChange={e => setEditAttraction({ ...editAttraction, thingsToDo: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="Feed Giant Aldabra Tortoises&#10;Snorkel the Coral Reefs&#10;Explore the Historical Prison Ruin"
                  rows={3}
                  className="w-full bg-[#0A1224] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Related Tours / Experiences (One per line)</label>
                <textarea
                  value={editAttraction.relatedTours?.join('\n') || ''}
                  onChange={e => setEditAttraction({ ...editAttraction, relatedTours: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="Stone Town Walking Tour&#10;Spice Tour & Stone Town Combo"
                  rows={3}
                  className="w-full bg-[#0A1224] border border-white/5 p-2 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <button
              onClick={() => setEditAttraction(null)}
              className="bg-[#0A1224] hover:bg-slate-800 text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAttraction}
              className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>Save Attraction</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
