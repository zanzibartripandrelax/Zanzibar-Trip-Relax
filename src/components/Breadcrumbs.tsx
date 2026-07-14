import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';

interface BreadcrumbItem {
  label: string;
  page?: Page;
  id?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  navigate: (page: Page, id?: string) => void;
}

export default function Breadcrumbs({ items, navigate }: BreadcrumbsProps) {
  return (
    <nav className="w-full bg-[#080F1D]/40 border-b border-white/5 py-3.5 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-2 text-xs font-medium text-white/50 select-none">
        
        {/* Base Home link */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-1 hover:text-[#D4A017] text-white/60 transition-colors cursor-pointer group"
          title="Return to Home"
        >
          <Home size={13} className="group-hover:scale-105 transition-transform" />
          <span className="hidden sm:inline">Home</span>
        </button>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={index}>
              <ChevronRight size={11} className="text-white/20 shrink-0" />
              
              {isLast ? (
                <span className="text-[#D4A017] font-semibold truncate max-w-[180px] sm:max-w-[300px] md:max-w-md">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => item.page && navigate(item.page, item.id)}
                  disabled={!item.page}
                  className={`hover:text-[#D4A017] text-white/70 transition-colors truncate max-w-[150px] sm:max-w-[200px] cursor-pointer ${
                    !item.page ? 'pointer-events-none' : ''
                  }`}
                >
                  {item.label}
                </button>
              )}
            </React.Fragment>
          );
        })}

      </div>
    </nav>
  );
}
