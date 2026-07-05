import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, FileText, CheckCircle, Upload, ArrowRight, X, User, Mail, Phone, Bookmark, Sparkles, Building2 } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { getJobs, JobVacancy } from '../lib/cmsStore';
import { showToast } from '../components/ToastNotification';

interface CareersProps {
  navigate: (page: Page) => void;
}

export default function Careers({ navigate }: CareersProps) {
  const jobs = getJobs();
  
  // States
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [activeJob, setActiveJob] = useState<JobVacancy | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    cvFile: null as File | null,
    cvFileName: ''
  });

  const departments = ['All', ...Array.from(new Set(jobs.map(j => j.department)))];

  const filteredJobs = selectedDept === 'All' 
    ? jobs 
    : jobs.filter(j => j.department === selectedDept);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        cvFile: file,
        cvFileName: file.name
      }));
      showToast(`Successfully uploaded ${file.name}`, 'success');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFormData(prev => ({
        ...prev,
        cvFile: file,
        cvFileName: file.name
      }));
      showToast(`Successfully uploaded ${file.name}`, 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.cvFileName) {
      showToast('Please fill out all fields and upload your CV.', 'error');
      return;
    }

    // Save applicant in localStorage
    const savedApplicants = JSON.parse(localStorage.getItem('ztr_applicants') || '[]');
    const newApplicant = {
      id: `app-${Date.now()}`,
      jobId: activeJob?.id || 'general',
      jobTitle: activeJob?.title || 'General Application',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      coverLetter: formData.coverLetter,
      cvName: formData.cvFileName,
      appliedAt: new Date().toLocaleDateString(),
      status: 'pending'
    };
    savedApplicants.push(newApplicant);
    localStorage.setItem('ztr_applicants', JSON.stringify(savedApplicants));

    setApplicationSubmitted(true);
    showToast('Your application was submitted successfully!', 'success');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      coverLetter: '',
      cvFile: null,
      cvFileName: ''
    });
    setApplicationSubmitted(false);
    setIsApplying(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Careers Banner */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#D4A017]/10 border border-[#D4A017]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase text-[#D4A017] tracking-widest">
            <Sparkles size={11} className="animate-pulse" />
            <span>Careers at Zanzibar Trip & Relax</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Join Our Authentic <span className="text-[#D4A017]">Swahili Journey</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Help us guide global travelers safely through Zanzibar's pristine coral gardens, historic town paths, and premier mainland game drives.
          </p>
        </div>
      </section>

      {/* Core Benefits section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/20 flex items-center justify-center text-[#D4A017]">
              <Sparkles size={20} />
            </div>
            <h3 className="text-base font-extrabold">Ethical Compensation</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              We pay standard-setting high local salaries, seasonal allowances, and 100% transparent tipping bonuses.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/20 flex items-center justify-center text-[#D4A017]">
              <Building2 size={20} />
            </div>
            <h3 className="text-base font-extrabold">Professional Training</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Access masterclasses on marine eco-protection, first aid, hospitality customer support, and language courses.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/20 flex items-center justify-center text-[#D4A017]">
              <Briefcase size={20} />
            </div>
            <h3 className="text-base font-extrabold">Environmental Stewardship</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Work for an operator that sponsors coral nurseries, bans single-use plastics, and supports coastal villages.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Vacancies Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left sidebar filtering */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Departments
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Select a department to filter vacancies</p>
          </div>

          <div className="flex flex-col gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-[#D4A017] text-[#0A1224] border-[#D4A017] font-black'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <span>{dept}</span>
                {selectedDept === dept && <CheckCircle size={14} className="stroke-[3]" />}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-[#D4A017]/10 to-[#0A1224] border border-[#D4A017]/25 p-5 rounded-2xl space-y-3">
            <h4 className="text-sm font-black text-[#D4A017] uppercase tracking-wider">Spontaneous Application</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Don't see a position matching your Swahili guiding or hospitality expertise? Submit a general application.
            </p>
            <button
              onClick={() => {
                setActiveJob(null);
                setIsApplying(true);
              }}
              className="text-[10px] text-white font-black bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Submit General CV</span>
              <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* Right main vacancy list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-wider" style={{ fontFamily: 'Playfair Display, serif' }}>
              Active Vacancies ({filteredJobs.length})
            </h2>
          </div>

          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl p-6">
                <Briefcase size={36} className="mx-auto text-slate-500 mb-3" />
                <h4 className="text-sm font-extrabold">No active job listings</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  We currently do not have active listings in this department. Apply spontaneously to register your details.
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className={`bg-white/5 border rounded-2xl p-6 transition-all space-y-4 relative overflow-hidden ${
                    job.status === 'closed' ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-white/25 shadow-xl'
                  }`}
                >
                  {/* Closed tag */}
                  {job.status === 'closed' && (
                    <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                      Closed / filled
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest font-black text-[#D4A017]">
                          {job.department}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {job.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-black mt-1 text-white">{job.title}</h3>
                    </div>

                    {job.status === 'open' && (
                      <button
                        onClick={() => {
                          setActiveJob(job);
                          setIsApplying(true);
                        }}
                        className="bg-[#D4A017] hover:bg-white text-[#0A1224] text-[10px] font-black px-4 py-2.5 rounded-full uppercase tracking-widest transition-all cursor-pointer shadow-lg shrink-0"
                      >
                        Apply for Job
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {job.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-400 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#D4A017]" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-[#D4A017]" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  {/* Requirements / Benefits toggle detail */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] uppercase tracking-widest font-black text-[#D4A017]">Core Requirements</h4>
                      <ul className="space-y-1 text-xs text-slate-300 font-medium list-disc list-inside">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="truncate">{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] uppercase tracking-widest font-black text-[#D4A017]">Key Perks & Benefits</h4>
                      <ul className="space-y-1 text-xs text-slate-300 font-medium list-disc list-inside">
                        {job.benefits.map((b, i) => (
                          <li key={i} className="truncate">{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Online Application Form Overlay Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#091122] border border-white/10 rounded-3xl w-full max-w-lg p-6 md:p-8 relative max-h-[90vh] overflow-y-auto space-y-6 scrollbar-thin">
            
            {/* Close button */}
            <button 
              onClick={resetForm}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 cursor-pointer"
            >
              <X size={18} />
            </button>

            {!applicationSubmitted ? (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <div className="text-[10px] uppercase tracking-widest font-black text-[#D4A017]">
                    {activeJob ? 'Bespoke Application' : 'Spontaneous General Application'}
                  </div>
                  <h3 className="text-xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {activeJob ? `Apply: ${activeJob.title}` : 'Submit Your CV'}
                  </h3>
                  <p className="text-xs text-slate-400">Join a team representing native Zanzibari hospitality.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 flex items-center gap-1.5 mb-1.5">
                      <User size={11} className="text-[#D4A017]" />
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Haji Ameir Khamis"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none transition-all duration-200 placeholder-slate-500 hover:border-white/20"
                    />
                  </div>

                  {/* Email & Phone fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 flex items-center gap-1.5 mb-1.5">
                        <Mail size={11} className="text-[#D4A017]" />
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="yourname@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none transition-all duration-200 placeholder-slate-500 hover:border-white/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 flex items-center gap-1.5 mb-1.5">
                        <Phone size={11} className="text-[#D4A017]" />
                        Phone / WhatsApp *
                      </label>
                      <input 
                        type="tel" 
                        required
                        placeholder="e.g. +255 777 123 456"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none transition-all duration-200 placeholder-slate-500 hover:border-white/20"
                      />
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 flex items-center gap-1.5 mb-1.5">
                      <FileText size={11} className="text-[#D4A017]" />
                      Brief Cover Note / Pitch (Optional)
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="Why do you want to join Zanzibar Trip & Relax? Tell us briefly."
                      value={formData.coverLetter}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none transition-all duration-200 placeholder-slate-500 hover:border-white/20 resize-none"
                    />
                  </div>

                  {/* CV Upload zone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 flex items-center gap-1.5 mb-1.5">
                      <Upload size={11} className="text-[#D4A017]" />
                      Upload CV / Resume (PDF, DOCX) *
                    </label>
                    
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-white/10 hover:border-[#D4A017]/40 bg-white/5 hover:bg-white/10 p-6 rounded-2xl text-center space-y-2 cursor-pointer transition-all duration-200 relative"
                    >
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload size={24} className="mx-auto text-slate-500" />
                      <div className="text-xs font-bold">
                        {formData.cvFileName ? (
                          <span className="text-[#D4A017]">{formData.cvFileName}</span>
                        ) : (
                          <span>Drag and drop file or <span className="text-[#D4A017]">browse</span></span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium">Supported formats: PDF, DOCX up to 10MB</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D4A017] to-[#F3C043] hover:from-[#F3C043] hover:to-[#D4A017] text-[#0A1224] text-xs font-extrabold py-4 rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-200"
                  >
                    <span>Submit Official Application</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            ) : (
              // Thank you confirmation state
              <div className="text-center py-8 space-y-6">
                <div className="h-16 w-16 bg-[#D4A017]/15 rounded-full flex items-center justify-center mx-auto border border-[#D4A017]/30 text-[#D4A017]">
                  <CheckCircle size={32} className="stroke-[2.5] animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Asante Sana!
                  </h3>
                  <p className="text-sm font-bold text-[#D4A017]">Application Received Successfully</p>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto font-medium">
                    We have received your application for <strong>{activeJob ? activeJob.title : 'General spontanous roles'}</strong>. Our HR operations team will review your CV and contact you via WhatsApp or Email if selected for an interview.
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  className="bg-white/10 hover:bg-white/20 border border-white/15 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Close Confirmation
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
