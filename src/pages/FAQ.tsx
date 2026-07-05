import { useState } from 'react';
import { HelpCircle, Book, HeartPulse, Shield, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { getSiteContent } from '../lib/cmsStore';

interface FAQProps {
  navigate: (page: Page) => void;
}

export default function FAQ({ navigate }: FAQProps) {
  const [openCard, setOpenCard] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setOpenCard(openCard === id ? null : id);
  };

  const content = getSiteContent();
  const dbFaqs = content.faqs;

  // Dynamically group FAQs by Category
  const categoriesMap: Record<string, { q: string; a: string }[]> = {};
  dbFaqs.forEach(item => {
    const category = item.category || 'General';
    if (!categoriesMap[category]) {
      categoriesMap[category] = [];
    }
    categoriesMap[category].push({ q: item.q, a: item.a });
  });

  const getIconForCategory = (category: string) => {
    const name = category.toLowerCase();
    if (name.includes('visa') || name.includes('passport') || name.includes('custom') || name.includes('book')) {
      return Book;
    }
    if (name.includes('health') || name.includes('vaccine') || name.includes('medical') || name.includes('hospital')) {
      return HeartPulse;
    }
    if (name.includes('safety') || name.includes('rule') || name.includes('security') || name.includes('local') || name.includes('dress')) {
      return Shield;
    }
    return Wallet;
  };

  const groupedFaqs = Object.keys(categoriesMap).map(category => ({
    category,
    icon: getIconForCategory(category),
    questions: categoriesMap[category]
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4">
          <HelpCircle className="w-12 h-12 text-[#D4A017] mx-auto mb-2 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto">
            Practical guidelines on visas, currencies, health tips, and local expectations in Zanzibar
          </p>
        </div>
      </section>

      {/* Accordion Layout */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {groupedFaqs.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-250">
                <cat.icon className="text-[#0B3B8C] w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0B3B8C] text-sm md:text-base uppercase tracking-wider">{cat.category}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {cat.questions.map((item, qIdx) => {
                  const uniqueId = `${catIdx}-${qIdx}`;
                  return (
                    <div key={qIdx} className="bg-white border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition-colors shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleQuestion(uniqueId)}
                        className="w-full text-left font-bold text-[#0B3B8C] text-sm md:text-base flex justify-between items-center gap-4 cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <span>{openCard === uniqueId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                      </button>
                      {openCard === uniqueId && (
                        <p className="text-gray-650 text-xs md:text-sm mt-3 leading-relaxed border-t pt-3 border-gray-100 whitespace-pre-wrap">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {groupedFaqs.length === 0 && (
            <div className="text-center py-10 bg-white border rounded-2xl">
              <p className="text-sm text-gray-500">No questions available in the FAQ section.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
