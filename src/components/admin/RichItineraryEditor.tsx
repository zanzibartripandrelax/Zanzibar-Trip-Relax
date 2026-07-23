import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Clock, Utensils, Home, Activity, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ItineraryDay } from '../../lib/cmsStore';

interface RichItineraryEditorProps {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
}

export const RichItineraryEditor: React.FC<RichItineraryEditorProps> = ({ days, onChange }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const addDay = () => {
    const nextDay = days.length + 1;
    const newDay: ItineraryDay = {
      dayNumber: nextDay,
      title: `Day ${nextDay}: New Adventure`,
      description: '',
      activities: [],
      images: []
    };
    onChange([...days, newDay]);
    setExpandedDay(days.length);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index).map((day, i) => ({
      ...day,
      dayNumber: i + 1
    }));
    onChange(newDays);
  };

  const updateDay = (index: number, updates: Partial<ItineraryDay>) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], ...updates };
    onChange(newDays);
  };

  const addActivity = (dayIndex: number) => {
    const activities = days[dayIndex].activities || [];
    updateDay(dayIndex, { activities: [...activities, ''] });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const activities = (days[dayIndex].activities || []).filter((_, i) => i !== activityIndex);
    updateDay(dayIndex, { activities });
  };

  const updateActivity = (dayIndex: number, activityIndex: number, value: string) => {
    const activities = [...(days[dayIndex].activities || [])];
    activities[activityIndex] = value;
    updateDay(dayIndex, { activities });
  };

  return (
    <div className="space-y-4 text-[#111827]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#1F2937] uppercase tracking-wider">Day-by-Day Itinerary</h4>
        <button
          type="button"
          onClick={addDay}
          className="flex items-center gap-2 bg-[#0B3B8C] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#082E6E] transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          Add Day
        </button>
      </div>

      <div className="space-y-3">
        {days.map((day, index) => (
          <div key={index} className="border border-[#D1D5DB] rounded-2xl overflow-hidden bg-white shadow-sm">
            <div 
              className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border-b border-[#D1D5DB]"
              onClick={() => setExpandedDay(expandedDay === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#0B3B8C] text-[#D4A017] flex items-center justify-center text-xs font-bold font-mono">
                  D{day.dayNumber}
                </span>
                <span className="font-bold text-[#111827]">{day.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeDay(index); }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Day"
                >
                  <Trash2 size={16} />
                </button>
                {expandedDay === index ? <ChevronUp size={16} className="text-[#1F2937]" /> : <ChevronDown size={16} className="text-[#1F2937]" />}
              </div>
            </div>

            {expandedDay === index && (
              <div className="p-5 space-y-4 bg-white animate-in fade-in slide-in-from-top-1 duration-200 text-[#111827]">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">Day Title</label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDay(index, { title: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] text-sm focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] outline-none caret-[#111827] font-medium"
                      placeholder="e.g. Day 1: Arrival & Stone Town Tour"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">Accommodation</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-white focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                      <Home size={14} className="text-[#6B7280]" />
                      <input
                        type="text"
                        value={day.accommodation || ''}
                        onChange={(e) => updateDay(index, { accommodation: e.target.value })}
                        className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                        placeholder="e.g. Nungwi Beach Resort"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    value={day.description}
                    onChange={(e) => updateDay(index, { description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] text-sm focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] outline-none resize-none caret-[#111827] font-medium"
                    placeholder="Describe the day's events..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">Meals</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-white focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                      <Utensils size={14} className="text-[#6B7280]" />
                      <input
                        type="text"
                        value={day.meals || ''}
                        onChange={(e) => updateDay(index, { meals: e.target.value })}
                        className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                        placeholder="e.g. B, L, D"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">Travel Time</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-white focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                      <Clock size={14} className="text-[#6B7280]" />
                      <input
                        type="text"
                        value={day.travelTime || ''}
                        onChange={(e) => updateDay(index, { travelTime: e.target.value })}
                        className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                        placeholder="e.g. 2 hrs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">GPS Location</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-white focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                      <MapPin size={14} className="text-[#6B7280]" />
                      <input
                        type="text"
                        value={day.gpsLocation?.label || ''}
                        onChange={(e) => updateDay(index, { gpsLocation: { lat: 0, lng: 0, label: e.target.value } })}
                        className="w-full text-sm text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                        placeholder="e.g. Stone Town"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider">Activities</label>
                    <button
                      type="button"
                      onClick={() => addActivity(index)}
                      className="text-[#0B3B8C] text-xs font-bold hover:underline cursor-pointer"
                    >
                      + Add Activity
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(day.activities || []).map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-[#D1D5DB] bg-white focus-within:border-[#0B3B8C] focus-within:ring-1 focus-within:ring-[#0B3B8C] transition-all">
                          <Activity size={14} className="text-[#6B7280]" />
                          <input
                            type="text"
                            value={activity}
                            onChange={(e) => updateActivity(index, actIndex, e.target.value)}
                            className="w-full text-xs text-[#111827] placeholder-[#6B7280] outline-none bg-transparent caret-[#111827] font-medium"
                            placeholder="Activity name..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeActivity(index, actIndex)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-2">Images (URLs)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(day.images || []).map((img, imgIndex) => (
                      <div key={imgIndex} className="relative group">
                        <img src={img} alt="" className="w-full h-20 object-cover rounded-xl border border-[#D1D5DB]" />
                        <button
                          type="button"
                          onClick={() => {
                            const images = (day.images || []).filter((_, i) => i !== imgIndex);
                            updateDay(index, { images });
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) {
                          const images = [...(day.images || []), url];
                          updateDay(index, { images });
                        }
                      }}
                      className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-[#D1D5DB] bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:border-[#0B3B8C] hover:text-[#0B3B8C] transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                      <span className="text-xs mt-1 font-semibold">Add URL</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
