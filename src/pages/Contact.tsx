import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { supabase } from '../lib/supabase';
import { syncLeadToCRM } from '../lib/crm';
import { showToast } from '../components/ToastNotification';
import { useAnalytics } from '../context/AnalyticsContext';

interface ContactProps {
  navigate: (page: Page) => void;
}

export default function Contact({ navigate }: ContactProps) {
  const { trackInquirySend, trackWhatsAppClick } = useAnalytics();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const contactFaqs = [
    { q: 'Where are you located in Zanzibar?', a: 'Our physical head office is based in Stone Town, Zanzibar. However, we coordinate pickup operations from all hotels around the island.' },
    { q: 'How early should I book tours?', a: 'For single-day tours, booking 24-48 hours in advance is usually fine. For custom holiday packages or safaris, we recommend booking weeks to months in advance to secure the best accommodations.' },
    { q: 'Do you offer airport transfer services?', a: 'Yes! We provide reliable private airport and ferry terminal transfers to Nungwi, Kendwa, Paje, Jambiani, Matemwe, or other locations.' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.whatsapp.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMsg('Name, WhatsApp, and message are required.');
      showToast('Validation failed: Name, WhatsApp, and Message are required.', 'error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const { error } = await supabase.from('contact_submissions').insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          whatsapp_number: formData.whatsapp.trim(),
          subject: formData.subject.trim() || 'General Inquiry',
          message: formData.message.trim(),
        }
      ]);

      if (error) throw error;

      // Standardize CRM lead tracking and fire conversions
      syncLeadToCRM({
        source: 'contact_form',
        fullName: formData.name.trim(),
        email: formData.email.trim() || null,
        whatsappNumber: formData.whatsapp.trim(),
        subject: formData.subject.trim() || 'General Inquiry',
        message: formData.message.trim()
      });

      // Dispatch custom GA4 event for accurate funnel tracking
      trackInquirySend('contact_form', formData.name.trim(), {
        subject: formData.subject.trim() || 'General Inquiry'
      });

      setStatus('success');
      showToast('Thank you! Your message has been safely delivered to our Zanzibar team.', 'success', 5000);
      setFormData({ name: '', email: '', whatsapp: '', subject: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      const msg = err.message || 'Could not send message. Please try again.';
      setErrorMsg(msg);
      showToast(`Submission failed: ${msg}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <section className="relative h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Contact Us
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Get in touch with our team of Zanzibar & Safari specialists
          </p>
        </div>
      </section>

      {/* Info & Form */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#0B3B8C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Reach Out Anytime
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Whether you want to book a single day tour, design an entire 2-week island + safari combo, or simply ask questions about visas, we are here for you. We speak Swahili, English, and coordinate with experienced specialists.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0B3B8C]/5 flex items-center justify-center text-[#0B3B8C] shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B3B8C] text-sm">Phone & WhatsApp</h4>
                  <p className="text-gray-600 mt-0.5 text-sm">+255 629 506 063</p>
                  <p className="text-gray-400 text-xs">Direct line & instant chat replies</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0B3B8C]/5 flex items-center justify-center text-[#0B3B8C] shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B3B8C] text-sm">Email Support</h4>
                  <p className="text-gray-600 mt-0.5 text-sm">info@zanzibartripandrelax.com</p>
                  <p className="text-gray-400 text-xs">General sales, partnership or feedback inquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0B3B8C]/5 flex items-center justify-center text-[#0B3B8C] shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B3B8C] text-sm">Our Location</h4>
                  <p className="text-gray-600 mt-0.5 text-sm">Stone Town, Zanzibar, Tanzania</p>
                  <p className="text-gray-400 text-xs">PO Box 1681, Zanzibar City</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0B3B8C]/5 flex items-center justify-center text-[#0B3B8C] shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B3B8C] text-sm">Working Hours</h4>
                  <p className="text-gray-600 mt-0.5 text-sm">Daily: 07:00 AM - 10:00 PM</p>
                  <p className="text-gray-400 text-xs">East Africa Time (EAT)</p>
                </div>
              </div>
            </div>

            {/* Quick Button */}
            <div className="bg-[#EBF5FF] rounded-2xl p-6 border border-blue-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-[#0B3B8C] shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-[#0B3B8C] text-sm">Need a quick reply?</p>
                  <p className="text-gray-500 text-xs">Message our local guides</p>
                </div>
              </div>
              <a
                href="https://wa.me/255629506063"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('Contact page quick reply', 'Hi WhatsApp')}
                className="bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold px-4 py-2 rounded-full text-xs transition-colors shrink-0"
              >
                Hi WhatsApp
              </a>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-lg p-8 md:p-10">
            <h3 className="text-2xl font-bold text-[#0B3B8C] mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              Send a Secure Message
            </h3>
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 size={32} className="mx-auto text-green-500" />
                <h4 className="font-bold">Message Delivered!</h4>
                <p className="text-sm">Thank you. Our experts will read your query and get back to you within a few hours.</p>
                <button type="button" onClick={() => setStatus('idle')} className="text-sm font-semibold text-[#0B3B8C] underline mt-2 block mx-auto">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none text-sm transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none text-sm transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none text-sm transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none text-sm transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300"
                    placeholder="e.g. Planning a safari combo"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Message Detail *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none text-sm transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300 resize-none"
                    placeholder="Hi! I wanted to check availability for..."
                    required
                  />
                </div>

                {status === 'error' && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#0B3B8C] hover:bg-[#082E6E] text-white font-extrabold py-4 rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 duration-200"
                >
                  <Send size={14} />
                  <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Faq Accordion */}
      <section className="py-16 bg-white border-t border-gray-100 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="w-10 h-10 mx-auto text-[#D4A017] mb-2" />
            <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Common Inquiries
            </h2>
          </div>
          <div className="space-y-4">
            {contactFaqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50 transition-colors">
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full text-left font-semibold text-[#0B3B8C] flex justify-between items-center"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-bold">{faqOpen === idx ? '−' : '+'}</span>
                </button>
                {faqOpen === idx && (
                  <p className="text-gray-600 text-sm mt-3 leading-relaxed animate-fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
