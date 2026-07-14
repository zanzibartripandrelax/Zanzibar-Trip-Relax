import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Eye, Edit, Copy, Trash2, ShieldAlert, Check, 
  FileUp, FileDown, Star, Calendar, DollarSign, ArrowUpDown
} from 'lucide-react';

interface ProductListTableProps {
  products: any[];
  productType: string;
  onEdit: (product: any) => void;
  onDuplicate: (product: any) => void;
  onDelete: (product: any) => void;
  onBulkAction: (action: 'publish' | 'archive' | 'delete', ids: string[]) => void;
  onImport: (importedProducts: any[]) => void;
  onCreateNew: () => void;
}

export default function ProductListTable({
  products,
  productType,
  onEdit,
  onDuplicate,
  onDelete,
  onBulkAction,
  onImport,
  onCreateNew
}: ProductListTableProps) {
  // Search & Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('A-Z');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Destinations List for Filter Dropdown
  const destinationsList = useMemo(() => {
    const destSet = new Set<string>();
    products.forEach(p => {
      if (p.destinations) {
        p.destinations.split('&').forEach((d: string) => destSet.add(d.trim()));
      }
    });
    return Array.from(destSet);
  }, [products]);

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle Select Individual
  const handleSelectIndividual = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        (p.title || '').toLowerCase().includes(q) ||
        (p.code || '').toLowerCase().includes(q) ||
        (p.shortSummary || p.desc || '').toLowerCase().includes(q) ||
        (p.destinations || '').toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== 'All') {
      result = result.filter(p => (p.status || 'Draft') === statusFilter);
    }

    // Destination
    if (destinationFilter !== 'All') {
      result = result.filter(p => (p.destinations || '').toLowerCase().includes(destinationFilter.toLowerCase()));
    }

    // Featured
    if (featuredFilter !== 'All') {
      const isFeatured = featuredFilter === 'Yes';
      result = result.filter(p => !!p.featured === isFeatured);
    }

    // Price Filter
    if (priceFilter !== 'All') {
      result = result.filter(p => {
        const val = Number(p.basePrice || p.price || 0);
        if (priceFilter === 'Budget (< $100)') return val < 100;
        if (priceFilter === 'Mid ($100 - $500)') return val >= 100 && val <= 500;
        if (priceFilter === 'Luxury (> $500)') return val > 500;
        return true;
      });
    }

    // Sort
    if (sortBy === 'A-Z') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'Z-A') {
      result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else if (sortBy === 'Newest') {
      result.sort((a, b) => new Date(b.lastUpdated || b.id).getTime() - new Date(a.lastUpdated || a.id).getTime());
    } else if (sortBy === 'Oldest') {
      result.sort((a, b) => new Date(a.lastUpdated || a.id).getTime() - new Date(b.lastUpdated || b.id).getTime());
    } else if (sortBy === 'Featured') {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, search, statusFilter, destinationFilter, priceFilter, featuredFilter, sortBy]);

  // JSON Export helper
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredProducts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${productType}_products_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSON Import handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImport(parsed);
          alert(`Successfully loaded ${parsed.length} items. Ready to persist.`);
        } else {
          alert("Imported file must be a valid JSON array.");
        }
      } catch (err) {
        alert("Could not read JSON file. Please check file formatting.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#0F1E36]/30 p-6 rounded-3xl border border-white/5">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight capitalize" style={{ fontFamily: 'Playfair Display, serif' }}>
            {productType === 'tour' ? 'Zanzibar Tours' : productType === 'safari' ? 'Tanzania Safaris' : productType === 'kilimanjaro' ? 'Kilimanjaro Treks' : productType === 'transfer' ? 'Airport Transfers' : 'Holiday Packages'} CMS
          </h3>
          <p className="text-xs text-slate-400">
            Professional travel product planner with role validations, automated pricing estimates, and rollback archives.
          </p>
        </div>

        {/* Top bar quick buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer border border-white/5 transition-all">
            <FileUp size={14} className="text-[#D4A017]" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button 
            onClick={handleExport}
            className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 border border-white/5 transition-all"
          >
            <FileDown size={14} className="text-[#D4A017]" />
            <span>Export</span>
          </button>

          <button 
            onClick={onCreateNew}
            className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg border-none cursor-pointer outline-none shrink-0"
          >
            <Plus size={16} />
            <span>Create New Product</span>
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 bg-[#0A1224]/50 border border-white/5 p-4 rounded-2xl">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Keywords</label>
          <div className="relative">
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Code, name, summary..."
              className="w-full bg-[#121B30] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4A017]"
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-[#121B30] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017]"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</label>
          <select 
            value={destinationFilter}
            onChange={e => setDestinationFilter(e.target.value)}
            className="w-full bg-[#121B30] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017]"
          >
            <option value="All">All Destinations</option>
            {destinationsList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Featured</label>
          <select 
            value={featuredFilter}
            onChange={e => setFeaturedFilter(e.target.value)}
            className="w-full bg-[#121B30] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017]"
          >
            <option value="All">All Products</option>
            <option value="Yes">Featured Only</option>
            <option value="No">Non-Featured</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price Tier</label>
          <select 
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="w-full bg-[#121B30] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017]"
          >
            <option value="All">All Prices</option>
            <option value="Budget (< $100)">Budget (&lt; $100)</option>
            <option value="Mid ($100 - $500)">Mid ($100 - $500)</option>
            <option value="Luxury (> $500)">Luxury (&gt; $500)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort List</label>
          <select 
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full bg-[#121B30] border border-[#D4A017]/30 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017]"
          >
            <option value="A-Z">A–Z (Alphabetical)</option>
            <option value="Z-A">Z–A (Alphabetical)</option>
            <option value="Newest">Newest Updated</option>
            <option value="Oldest">Oldest Created</option>
            <option value="Featured">Featured First</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Panel */}
      {selectedIds.length > 0 && (
        <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 px-5 py-3 rounded-2xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-[#D4A017]" />
            <span className="text-xs font-bold text-slate-200">
              {selectedIds.length} items selected for bulk execution:
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { onBulkAction('publish', selectedIds); setSelectedIds([]); }}
              className="bg-green-950 hover:bg-green-900 border border-green-500/30 text-green-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all"
            >
              Bulk Publish
            </button>
            <button 
              onClick={() => { onBulkAction('archive', selectedIds); setSelectedIds([]); }}
              className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all"
            >
              Bulk Archive
            </button>
            <button 
              onClick={() => { onBulkAction('delete', selectedIds); setSelectedIds([]); }}
              className="bg-red-950/40 hover:bg-red-900/60 border border-red-500/25 text-red-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-[#0F182E]">
              <tr>
                <th className="py-4 px-5 text-left w-12">
                  <input 
                    type="checkbox" 
                    className="accent-[#D4A017] rounded cursor-pointer"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="py-4 px-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider w-16">Image</th>
                <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Product details</th>
                <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Code / Cat</th>
                <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Destination</th>
                <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Base Price</th>
                <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Edited</th>
                <th className="py-4 px-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-xs">
                    No matching travel products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const coverImage = p.image || p.img || 'https://images.unsplash.com/photo-1540206395-68808572332f';
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <input 
                          type="checkbox" 
                          className="accent-[#D4A017] rounded cursor-pointer"
                          checked={selectedIds.includes(p.id)}
                          onChange={e => handleSelectIndividual(p.id, e.target.checked)}
                        />
                      </td>
                      <td className="py-4 px-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-white/10 bg-slate-800">
                          <img src={coverImage} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="max-w-[200px]">
                          <p className="text-xs font-bold text-white truncate" title={p.title}>{p.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{p.shortSummary || p.desc || 'No summary description.'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-[9px] bg-white/5 px-2 py-0.5 rounded text-slate-300 block w-max mb-1 uppercase">
                          {p.code || 'CODE-NA'}
                        </span>
                        <span className="text-[9px] text-[#D4A017] font-bold block uppercase">
                          {p.packageCategory || p.category || 'Curated'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-300">{p.destinations || 'Zanzibar'}</td>
                      <td className="py-4 px-4 text-xs text-slate-300">{p.duration || 'Flexible'}</td>
                      <td className="py-4 px-4 font-mono text-xs text-white font-bold">${p.basePrice || p.price || 0}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          p.status === 'Published' 
                            ? 'bg-green-950/50 border-green-500/20 text-green-400' 
                            : p.status === 'Pending Approval'
                            ? 'bg-yellow-950/50 border-yellow-500/20 text-yellow-400'
                            : p.status === 'Archived'
                            ? 'bg-slate-900/50 border-white/10 text-slate-400'
                            : 'bg-[#121B30] border-white/5 text-slate-300'
                        }`}>
                          <span className="h-1 w-1 rounded-full bg-current" />
                          <span>{p.status || 'Draft'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-[10px] text-slate-300">{p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString() : 'Unspecified'}</p>
                        <p className="text-[9px] text-slate-500 italic">By: {p.updatedBy || 'Staff'}</p>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => onEdit(p)}
                            title="Edit"
                            className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-xl text-slate-200 transition-all cursor-pointer"
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => onDuplicate(p)}
                            title="Duplicate"
                            className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-xl text-slate-300 transition-all cursor-pointer"
                          >
                            <Copy size={12} />
                          </button>
                          <button 
                            onClick={() => onDelete(p)}
                            title="Delete"
                            className="bg-red-950/20 hover:bg-red-900/40 border border-red-500/10 p-2 rounded-xl text-red-400 transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
