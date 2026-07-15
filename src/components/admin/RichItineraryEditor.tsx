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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#0B3B8C] uppercase tracking-wider">Day-by-Day Itinerary</h4>
        <button
          type="button"
          onClick={addDay}
          className="flex items-center gap-2 bg-[#0B3B8C] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#082E6E] transition-colors"
        >
          <Plus size={14} />
          Add Day
        </button>
      </div>

      <div className="space-y-3">
        {days.map((day, index) => (
          <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div 
              className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => setExpandedDay(expandedDay === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#0B3B8C] text-[#D4A017] flex items-center justify-center text-xs font-black font-mono">
                  D{day.dayNumber}
                </span>
                <span className="font-bold text-slate-800">{day.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeDay(index); }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Day"
                >
                  <Trash2 size={14} />
                </button>
                {expandedDay === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {expandedDay === index && (
              <div className="p-4 space-y-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Day Title</label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDay(index, { title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-[#0B3B8C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Accommodation</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
                      <Home size={14} className="text-slate-400" />
                      <input
                        type="text"
                        value={day.accommodation || ''}
                        onChange={(e) => updateDay(index, { accommodation: e.target.value })}
                        className="w-full text-sm outline-none"
                        placeholder="e.g. Nungwi Beach Resort"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Description</label>
                  <textarea
                    value={day.description}
                    onChange={(e) => updateDay(index, { description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-[#0B3B8C] outline-none resize-none"
                    placeholder="Describe the day's events..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Meals</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
                      <Utensils size={14} className="text-slate-400" />
                      <input
                        type="text"
                        value={day.meals || ''}
                        onChange={(e) => updateDay(index, { meals: e.target.value })}
                        className="w-full text-sm outline-none"
                        placeholder="e.g. B, L, D"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Travel Time</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
                      <Clock size={14} className="text-slate-400" />
                      <input
                        type="text"
                        value={day.travelTime || ''}
                        onChange={(e) => updateDay(index, { travelTime: e.target.value })}
                        className="w-full text-sm outline-none"
                        placeholder="e.g. 2 hrs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">GPS Location</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
                      <MapPin size={14} className="text-slate-400" />
                      <input
                        type="text"
                        value={day.gpsLocation?.label || ''}
                        onChange={(e) => updateDay(index, { gpsLocation: { lat: 0, lng: 0, label: e.target.value } })}
                        className="w-full text-sm outline-none"
                        placeholder="e.g. Stone Town"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Activities</label>
                    <button
                      type="button"
                      onClick={() => addActivity(index)}
                      className="text-[#0B3B8C] text-[10px] font-bold hover:underline"
                    >
                      + Add Activity
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(day.activities || []).map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/30">
                          <Activity size={12} className="text-slate-400" />
                          <input
                            type="text"
                            value={activity}
                            onChange={(e) => updateActivity(index, actIndex, e.target.value)}
                            className="w-full text-xs outline-none bg-transparent"
                            placeholder="Activity name..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeActivity(index, actIndex)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Images (URLs)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(day.images || []).map((img, imgIndex) => (
                      <div key={imgIndex} className="relative group">
                        <img src={img} alt="" className="w-full h-20 object-cover rounded-lg border border-slate-200" />
                        <button
                          type="button"
                          onClick={() => {
                            const images = (day.images || []).filter((_, i) => i !== imgIndex);
                            updateDay(index, { images });
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={10} />
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
                      className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-[#0B3B8C] hover:text-[#0B3B8C] transition-all"
                    >
                      <Plus size={16} />
                      <span className="text-[10px] mt-1 font-bold">Add URL</span>
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
