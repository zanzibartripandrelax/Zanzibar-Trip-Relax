import React, { useState, useMemo, useRef } from 'react';
import { Search, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Ban, Upload, FileText, AlertCircle, CheckCircle2, Trash2, Calendar } from 'lucide-react';

export interface ColumnConfig<T> {
  header: string;
  key: keyof T | string;
  className?: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface DateRangeFilterConfig {
  key: string;
  label: string;
}

interface ReusableTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  searchKeys?: (keyof T | string)[];
  searchPlaceholder?: string;
  statusFilterKey?: keyof T;
  statusOptions?: StatusOption[];
  dateRangeFilters?: DateRangeFilterConfig[];
  csvFilename?: string;
  csvHeaders?: string[];
  csvRowMapper?: (item: T) => (string | number | boolean)[];
  onExportSuccess?: () => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  pageSize?: number;
  onBulkUpload?: (parsedRows: any[]) => Promise<void> | void;
  bulkUploadTemplateHeaders?: string[];
  onExportPDF?: () => void;
}

export function ReusableTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchKeys = [],
  searchPlaceholder = "Search...",
  statusFilterKey,
  statusOptions = [],
  dateRangeFilters = [],
  csvFilename = "table_data.csv",
  csvHeaders,
  csvRowMapper,
  onExportSuccess,
  onRowClick,
  emptyMessage = "No results found.",
  pageSize = 10,
  onBulkUpload,
  bulkUploadTemplateHeaders,
  onExportPDF,
}: ReusableTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Date Range Filtering State
  const [selectedDateField, setSelectedDateField] = useState<string>(
    dateRangeFilters && dateRangeFilters.length > 0 ? dateRangeFilters[0].key : ''
  );
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);

  // Bulk Upload State
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Reset page when search or filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  // 2. Dynamic Status Counts for filtering buttons
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: data.length };
    if (!statusFilterKey) return counts;

    data.forEach((item) => {
      const val = String(item[statusFilterKey]);
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });

    return counts;
  }, [data, statusFilterKey]);

  const getItemDateString = (item: any, key: string): string | null => {
    const val = item[key];
    if (!val) return null;
    if (typeof val === 'string') {
      if (val.includes('T')) {
        return val.split('T')[0];
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
        return val.substring(0, 10);
      }
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        try {
          return d.toISOString().split('T')[0];
        } catch (_) {
          return null;
        }
      }
    }
    return null;
  };

  // 3. Search, status, and date-range filtration logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Status filtering
    if (statusFilterKey && filterStatus !== 'all') {
      result = result.filter(
        (item) => String(item[statusFilterKey]).toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Search query filtering
    if (searchQuery.trim() && searchKeys.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        return searchKeys.some((k) => {
          // nested or direct key access
          const val = item[k as string];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    // Date range filtering
    if (dateRangeFilters && dateRangeFilters.length > 0) {
      const activeField = selectedDateField || dateRangeFilters[0].key;
      if (startDate || endDate) {
        result = result.filter((item) => {
          const itemDateStr = getItemDateString(item, activeField);
          if (!itemDateStr) return false;
          
          if (startDate && itemDateStr < startDate) {
            return false;
          }
          if (endDate && itemDateStr > endDate) {
            return false;
          }
          return true;
        });
      }
    }

    return result;
  }, [data, searchQuery, filterStatus, statusFilterKey, searchKeys, dateRangeFilters, selectedDateField, startDate, endDate]);

  // 4. Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortKey, sortOrder]);

  // 5. Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPagedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // 6. Sort handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null); // Clear sorting
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // 7. CSV Export
  const handleCSVExport = () => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    let headers: string[] = [];
    if (csvHeaders) {
      headers = csvHeaders;
    } else {
      headers = columns.map(c => c.header).filter(h => h && typeof h === 'string') as string[];
    }

    let rows: (string | number | boolean)[][] = [];
    if (csvRowMapper) {
      rows = data.map(csvRowMapper);
    } else {
      rows = data.map(item => {
        return columns.map(c => {
          if (typeof c.key === 'string' && item[c.key] !== undefined) {
            return String(item[c.key]);
          }
          return '';
        });
      });
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // include BOM for Excel Arabic/special characters
      + [headers.join(','), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", csvFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onExportSuccess) {
      onExportSuccess();
    }
  };

  // 8. CSV Normalizer & Bulk Upload Handlers
  const normalizeCSVKey = (rawHeader: string): string => {
    const h = rawHeader.toLowerCase().trim().replace(/^"|"$/g, '');
    if (h === 'full name' || h === 'fullname' || h === 'customer name' || h === 'name' || h === 'customer_name') return 'full_name';
    if (h === 'email' || h === 'email address' || h === 'email_address') return 'email';
    if (h === 'whatsapp' || h === 'whatsapp number' || h === 'whatsapp_number' || h === 'phone' || h === 'phone number' || h === 'telephone') return 'whatsapp_number';
    if (h === 'guests' || h === 'number of guests' || h === 'number_of_guests' || h === 'travelers' || h === 'traveler count') return 'number_of_guests';
    if (h === 'tour' || h === 'tour name' || h === 'tour_name' || h === 'experience' || h === 'experience name' || h === 'experience_name' || h === 'package') return 'tour_name';
    if (h === 'date' || h === 'preferred date' || h === 'preferred_date' || h === 'travel date' || h === 'date requested' || h === 'date_requested') return 'preferred_date';
    if (h === 'pickup' || h === 'pickup location' || h === 'pickup_location') return 'pickup_location';
    if (h === 'status') return 'status';
    if (h === 'message' || h === 'notes' || h === 'customer message') return 'message';
    
    return h.replace(/[\s-]+/g, '_');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setUploadError("Invalid file type. Please upload a CSV file (.csv).");
      setParsedData([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setUploadError("The file appears to be empty.");
          return;
        }

        const rows: string[] = [];
        let currentLine = '';
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];
          if (char === '"') {
            inQuotes = !inQuotes;
            currentLine += char;
          } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (currentLine.trim()) {
              rows.push(currentLine);
            }
            currentLine = '';
            if (char === '\r' && nextChar === '\n') {
              i++;
            }
          } else {
            currentLine += char;
          }
        }
        if (currentLine.trim()) {
          rows.push(currentLine);
        }

        if (rows.length < 2) {
          setUploadError("The CSV file must contain a header row and at least one data row.");
          return;
        }

        const parseRow = (rowText: string): string[] => {
          const cols: string[] = [];
          let currentCol = '';
          let inQuo = false;
          for (let i = 0; i < rowText.length; i++) {
            const char = rowText[i];
            const nextChar = rowText[i + 1];
            if (char === '"') {
              if (inQuo && nextChar === '"') {
                currentCol += '"';
                i++;
              } else {
                inQuo = !inQuo;
              }
            } else if (char === ',' && !inQuo) {
              cols.push(currentCol.trim());
              currentCol = '';
            } else {
              currentCol += char;
            }
          }
          cols.push(currentCol.trim());
          return cols;
        };

        const rawHeaders = parseRow(rows[0]).map(h => h.replace(/^\uFEFF/, '').replace(/^"|"$/g, '').trim());
        setDetectedHeaders(rawHeaders);

        const normalizedKeys = rawHeaders.map(h => normalizeCSVKey(h));

        const hasName = normalizedKeys.includes('full_name');
        const hasWhatsApp = normalizedKeys.includes('whatsapp_number');
        if (!hasName || !hasWhatsApp) {
          setUploadError(`Missing mandatory columns. Your CSV must map to 'Customer Name' and 'WhatsApp'. Detected columns: [${rawHeaders.join(', ')}]`);
          return;
        }

        const items: any[] = [];
        for (let i = 1; i < rows.length; i++) {
          const cols = parseRow(rows[i]);
          const item: Record<string, any> = {};
          normalizedKeys.forEach((key, index) => {
            if (key) {
              let val = cols[index] || '';
              if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1).replace(/""/g, '"');
              }
              item[key] = val;
            }
          });

          if (item.number_of_guests) {
            item.number_of_guests = parseInt(item.number_of_guests, 10) || 1;
          } else {
            item.number_of_guests = 1;
          }

          if (!item.status) {
            item.status = 'confirmed';
          }

          if (item.full_name && item.whatsapp_number) {
            items.push(item);
          }
        }

        if (items.length === 0) {
          setUploadError("No valid rows were parsed. Check that 'Customer Name' and 'WhatsApp' are not empty in your rows.");
        } else {
          setParsedData(items);
          setUploadError(null);
        }

      } catch (err: any) {
        setUploadError(`Failed to parse CSV file: ${err?.message || 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!onBulkUpload || parsedData.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      await onBulkUpload(parsedData);
      setUploadSuccess(true);
      setTimeout(() => {
        setParsedData([]);
        setUploadSuccess(false);
        setShowUploadSection(false);
      }, 2500);
    } catch (err: any) {
      setUploadError(err?.message || 'Error occurred during database insertion.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelImport = () => {
    setParsedData([]);
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = bulkUploadTemplateHeaders || [
      'Customer Name',
      'Email',
      'WhatsApp',
      'Guests',
      'Experience Name',
      'Date Requested',
      'Pickup',
      'Status',
      'Message'
    ];
    const sampleRows = [
      ['Ahmed Salum', 'ahmed@example.com', '+255 777 123456', '2', 'Safaris: 3-Day Luxury Serengeti Safari', '2026-07-15', 'Zanzibar Airport terminal 1', 'confirmed', 'Prefers window seats'],
      ['Sarah Connor', 'sarah@example.com', '+1 415 555 2671', '4', 'Kilimanjaro: 7-Day Machame Route', '2026-08-01', 'Arusha Mount Meru Hotel lobby', 'pending', 'Requires vegetarian options']
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [templateHeaders.join(','), ...sampleRows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Zanzibar_Bulk_Booking_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center bg-[#0A1224] border border-white/5 p-4 rounded-2xl">
        {/* Search */}
        {searchKeys.length > 0 && (
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-xs bg-[#121B30] border border-white/10 rounded-full py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        {/* Status Filters */}
        {statusFilterKey && statusOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {statusOptions.map((st) => {
              const count = statusCounts[st.value] || 0;
              const isSelected = filterStatus === st.value;
              return (
                <button
                  key={st.value}
                  onClick={() => handleFilterChange(st.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#D4A017] text-[#020C1F] border-[#D4A017]'
                      : 'bg-[#121B30] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/10'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    isSelected ? 'bg-[#020C1F]/20 text-[#020C1F]' : 'bg-white/5 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          {dateRangeFilters && dateRangeFilters.length > 0 && (
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                showDateFilter || startDate || endDate
                  ? 'bg-amber-500/20 border-[#D4A017] text-white font-black'
                  : 'bg-[#121B30] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Calendar size={14} className={startDate || endDate ? "text-[#D4A017]" : ""} />
              <span>Date Range</span>
              {(startDate || endDate) && (
                <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse"></span>
              )}
            </button>
          )}

          <button
            onClick={handleCSVExport}
            disabled={loading || data.length === 0}
            className="bg-slate-800 hover:bg-slate-750 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              disabled={loading || data.length === 0}
              className="bg-[#0B3B8C] hover:bg-[#082E6E] disabled:opacity-50 disabled:cursor-not-allowed border border-[#0B3B8C]/10 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <FileText size={14} />
              <span>Export PDF</span>
            </button>
          )}

          {onBulkUpload && (
            <button
              onClick={() => setShowUploadSection(!showUploadSection)}
              className={`font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                showUploadSection
                  ? 'bg-[#D4A017] border-[#D4A017] text-[#020C1F] font-black'
                  : 'bg-[#121B30] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Upload size={14} />
              <span>Bulk Import</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Range Filter Panel */}
      {dateRangeFilters && dateRangeFilters.length > 0 && showDateFilter && (
        <div className="bg-[#0A1224] border border-[#D4A017]/15 p-4 rounded-2xl space-y-3.5 shadow-lg relative overflow-hidden transition-all duration-300 animate-fade-in">
          <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-[#D4A017] to-[#0B3B8C] h-full"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#D4A017]/10 rounded-lg text-[#D4A017]">
                <Calendar size={15} />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Filter by Date Range</span>
                <span className="text-[10px] text-slate-400">Specify start and end dates to filter booking records.</span>
              </div>
            </div>

            {/* Clear Filters Button if any date is filled */}
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[10px] text-red-400 hover:text-red-350 font-bold flex items-center gap-1 transition-colors cursor-pointer border border-red-500/10 px-2 py-1 bg-red-500/5 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 size={11} />
                <span>Reset Dates</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pl-3">
            {/* 1. Date Field Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block">Select Date Field</label>
              <select
                value={selectedDateField || dateRangeFilters[0].key}
                onChange={(e) => {
                  setSelectedDateField(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017] transition-all cursor-pointer"
              >
                {dateRangeFilters.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* 2. Start Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block">Start Date (From)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017] transition-all font-mono"
              />
            </div>

            {/* 3. End Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block">End Date (To)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017] transition-all font-mono"
              />
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-3">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mr-1">Shortcuts:</span>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-[#121B30] hover:bg-[#1f2a46] border border-white/5 rounded-lg text-[9px] font-bold text-slate-300 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const start = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
                const end = new Date(today.setDate(today.getDate() - today.getDay() + 6)).toISOString().split('T')[0];
                setStartDate(start);
                setEndDate(end);
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-[#121B30] hover:bg-[#1f2a46] border border-white/5 rounded-lg text-[9px] font-bold text-slate-300 transition-colors cursor-pointer"
            >
              This Week
            </button>
            <button
              onClick={() => {
                const date = new Date();
                const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
                const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
                setStartDate(start);
                setEndDate(end);
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-[#121B30] hover:bg-[#1f2a46] border border-white/5 rounded-lg text-[9px] font-bold text-slate-300 transition-colors cursor-pointer"
            >
              This Month
            </button>
            <button
              onClick={() => {
                const date = new Date();
                const start = new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
                const end = new Date(date.getFullYear(), 11, 31).toISOString().split('T')[0];
                setStartDate(start);
                setEndDate(end);
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-[#121B30] hover:bg-[#1f2a46] border border-white/5 rounded-lg text-[9px] font-bold text-slate-300 transition-colors cursor-pointer"
            >
              This Year
            </button>
          </div>
        </div>
      )}

      {/* Bulk Upload Section */}
      {onBulkUpload && showUploadSection && (
        <div className="bg-[#0A1224] border border-[#D4A017]/20 p-6 rounded-2xl space-y-4 shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A017] via-[#0B3B8C] to-[#D4A017]"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Upload size={16} className="text-[#D4A017]" />
                <span>Bulk Booking Import Engine</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Load reservations instantly via spreadsheet CSV data.
              </p>
            </div>
            
            <button
              onClick={handleDownloadTemplate}
              className="bg-[#121B30] hover:bg-slate-800 text-[#D4A017] border border-[#D4A017]/20 hover:border-[#D4A017]/40 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download size={12} />
              <span>Download Blank CSV Template</span>
            </button>
          </div>

          {/* Drag & Drop Box */}
          {parsedData.length === 0 && !uploadSuccess && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                dragActive
                  ? 'border-[#D4A017] bg-[#D4A017]/5 text-white'
                  : 'border-white/10 hover:border-white/20 bg-[#121B30]/30 hover:bg-[#121B30]/50 text-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="p-3 bg-[#121B30] rounded-full text-[#D4A017] border border-white/5">
                <FileText size={24} className="animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Drag and drop your spreadsheet CSV here, or <span className="text-[#D4A017] hover:underline">browse locally</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-md mx-auto">
                  Supports flexible header mappings. Mandatory columns: <span className="text-slate-400 font-bold">Customer Name</span> and <span className="text-slate-400 font-bold">WhatsApp</span>.
                </p>
              </div>
            </div>
          )}

          {/* Parsing Error */}
          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-xs text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Import Verification Alert</p>
                <p className="text-[10px] leading-relaxed text-red-300/90">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Bulk Ingestion Successful!</p>
                <p className="text-xs text-slate-400">Reservations compiled and active in the central database.</p>
              </div>
            </div>
          )}

          {/* Parsed CSV Preview Table */}
          {parsedData.length > 0 && !uploadSuccess && (
            <div className="space-y-3 border border-white/5 rounded-xl bg-[#121B30]/20 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Verified {parsedData.length} records ready for bulk ingestion</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Review parsed mapping of the first few records below.
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleCancelImport}
                    disabled={uploading}
                    className="px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all text-[10px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Clear</span>
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={uploading}
                    className="px-4 py-1.5 rounded-lg bg-[#D4A017] hover:bg-[#bfa315] disabled:opacity-50 text-[#020C1F] font-black transition-all text-[10px] cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#020C1F] border-t-transparent rounded-full animate-spin"></div>
                        <span>Ingesting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Confirm Bulk Import ({parsedData.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scrollable Mini Table Preview */}
              <div className="overflow-x-auto border border-white/5 rounded-lg">
                <table className="w-full text-left text-[11px] text-slate-300 animate-fade-in">
                  <thead className="bg-[#121B30] text-slate-400 font-bold border-b border-white/5">
                    <tr>
                      <th className="p-2.5">Customer Name</th>
                      <th className="p-2.5">WhatsApp Contact</th>
                      <th className="p-2.5">Guests</th>
                      <th className="p-2.5">Experience</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedData.slice(0, 5).map((row, index) => (
                      <tr key={index} className="hover:bg-white/5">
                        <td className="p-2.5 font-semibold text-white">
                          {row.full_name}
                          {row.email && <span className="block text-[9px] font-normal text-slate-500">{row.email}</span>}
                        </td>
                        <td className="p-2.5 font-mono">{row.whatsapp_number}</td>
                        <td className="p-2.5">{row.number_of_guests}</td>
                        <td className="p-2.5 text-[#D4A017] font-semibold">{row.tour_name || 'Generic Experience'}</td>
                        <td className="p-2.5 text-slate-400">{row.preferred_date || 'N/A'}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15">
                            {row.status || 'confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 5 && (
                <p className="text-center text-[9px] font-medium text-slate-500 pt-1">
                  Showing first 5 of {parsedData.length} total rows.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017] mx-auto" />
            <p className="text-xs font-medium">Retrieving database ledger...</p>
          </div>
        ) : currentPagedData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121B30] text-slate-300 font-bold border-b border-white/5">
                  {columns.map((col, idx) => {
                    const isColSortable = col.sortable !== false;
                    const isSorted = sortKey === col.key;
                    return (
                      <th
                        key={idx}
                        className={`p-4 ${col.className || ''} ${
                          isColSortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''
                        }`}
                        onClick={() => isColSortable && handleSort(col.key as string)}
                      >
                        <div className="flex items-center gap-1">
                          <span>{col.header}</span>
                          {isColSortable && (
                            <span className="text-slate-500">
                              {isSorted ? (
                                sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                              ) : (
                                <ChevronDown size={13} className="opacity-30" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentPagedData.map((item, rowIdx) => (
                  <tr
                    key={item.id || rowIdx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors ${
                      onRowClick ? 'hover:bg-white/5 cursor-pointer' : 'hover:bg-white/5'
                    }`}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`p-4 ${col.className || ''}`}>
                        {col.render
                          ? col.render(item)
                          : item[col.key as string] !== undefined
                          ? String(item[col.key as string])
                          : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <Ban className="w-10 h-10 mx-auto text-slate-500 animate-pulse" />
            <p className="text-xs font-semibold">{emptyMessage}</p>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && sortedData.length > 0 && (
          <div className="bg-[#121B30] border-t border-white/5 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
            <div>
              Showing <span className="text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="text-white">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{' '}
              of <span className="text-white">{sortedData.length}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/5 bg-[#0A1224] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // pagination limit to show first, last, and surrounding pages
                  const isVisible =
                    totalPages <= 5 ||
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1;

                  if (!isVisible) {
                    if (p === 2 || p === totalPages - 1) {
                      return <span key={p} className="px-1 text-slate-600">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        currentPage === p
                          ? 'bg-[#D4A017] text-[#020C1F] font-black'
                          : 'bg-[#0A1224] hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/5 bg-[#0A1224] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
