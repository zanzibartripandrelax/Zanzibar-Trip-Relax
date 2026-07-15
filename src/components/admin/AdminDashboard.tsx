import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, DollarSign, Activity, Globe, User, Lock, 
  Eye, EyeOff, Briefcase, Navigation, MapPin, Clock
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface AdminDashboardProps {
  session: any;
  activeDashboardBookings: any[];
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  totalInquiriesCount: number;
  totalCustomersCount: number;
  returningCustomersCount: number;
  totalTravelersCount: number;
  dashboardViewType: 'global' | 'personal';
  setDashboardViewType: (type: 'global' | 'personal') => void;
}

export default function AdminDashboard({
  session,
  activeDashboardBookings,
  confirmedCount,
  pendingCount,
  cancelledCount,
  totalInquiriesCount,
  totalCustomersCount,
  returningCustomersCount,
  totalTravelersCount,
  dashboardViewType,
  setDashboardViewType
}: AdminDashboardProps) {
  const [showCharts, setShowCharts] = useState(true);
  const [chartTab, setChartTab] = useState<'trends' | 'payments' | 'packages' | 'statuses'>('trends');
  const [revenueInterval, setRevenueInterval] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const getEstimatedPrice = (tourName: string) => {
    const name = (tourName || '').toLowerCase();
    if (name.includes('safari blue') || name.includes('ocean cruise')) return 45;
    if (name.includes('mnemba')) return 35;
    if (name.includes('stone town')) return 20;
    if (name.includes('prison')) return 25;
    if (name.includes('spice')) return 15;
    if (name.includes('jozani') || name.includes('forest')) return 25;
    if (name.includes('sunset')) return 55;
    if (name.includes('nakupenda')) return 70;
    if (name.includes('quad') || name.includes('atv')) return 65;
    if (name.includes('serengeti') || name.includes('safari')) return 350;
    if (name.includes('kilimanjaro')) return 500;
    return 50; 
  };

  const chartData = useMemo(() => {
    const dailyCounts: Record<string, any> = {};
    const weeklyCounts: Record<string, any> = {};
    const monthlyCounts: Record<string, any> = {};
    const tourCounts: Record<string, any> = {};
    const statusCounts: Record<string, any> = {
      pending: { name: 'Pending', value: 0 },
      confirmed: { name: 'Confirmed', value: 0 },
      approved: { name: 'Approved', value: 0 },
      rejected: { name: 'Rejected', value: 0 },
      cancelled: { name: 'Cancelled', value: 0 }
    };

    const getWeekLabelAndDate = (dateString: string) => {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return null;
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.getFullYear(), d.getMonth(), diff);
      const mm = String(weekStart.getMonth() + 1).padStart(2, '0');
      const dd = String(weekStart.getDate()).padStart(2, '0');
      return { label: `Wk of ${mm}/${dd}`, date: weekStart };
    };

    let calculatedRevenue = 0;
    let totalGuestsCount = 0;
    let collectedPaidRevenue = 0;
    let pendingDepositsRevenue = 0;
    let pendingBalancesRevenue = 0;
    let overdueBalancesRevenue = 0;
    const today = new Date();

    activeDashboardBookings.forEach(b => {
      const pricePerGuest = getEstimatedPrice(b.tour_name);
      const guests = Number(b.number_of_guests) || 1;
      const totalCost = pricePerGuest * guests;
      const st = (b.status || 'pending').toLowerCase();
      
      if (st !== 'cancelled' && st !== 'rejected') {
        calculatedRevenue += totalCost;
        totalGuestsCount += guests;
        
        // Simulating collection statuses
        if (st === 'pending') {
          pendingDepositsRevenue += totalCost * 0.3;
          pendingBalancesRevenue += totalCost * 0.7;
        } else {
          collectedPaidRevenue += totalCost * 0.3;
          pendingBalancesRevenue += totalCost * 0.7;
        }
      }

      const dateStr = b.preferred_date || '';
      if (dateStr && st !== 'cancelled' && st !== 'rejected') {
        if (!dailyCounts[dateStr]) dailyCounts[dateStr] = { date: dateStr, bookings: 0, guests: 0, revenue: 0 };
        dailyCounts[dateStr].bookings += 1;
        dailyCounts[dateStr].guests += guests;
        dailyCounts[dateStr].revenue += totalCost;

        const weekInfo = getWeekLabelAndDate(dateStr);
        if (weekInfo) {
          if (!weeklyCounts[weekInfo.label]) weeklyCounts[weekInfo.label] = { week: weekInfo.label, weekDate: weekInfo.date, bookings: 0, guests: 0, revenue: 0 };
          weeklyCounts[weekInfo.label].bookings += 1;
          weeklyCounts[weekInfo.label].guests += guests;
          weeklyCounts[weekInfo.label].revenue += totalCost;
        }

        let monthLabel = 'Unspecified';
        if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthNum = parseInt(parts[1], 10);
          if (monthNum >= 1 && monthNum <= 12) monthLabel = `${months[monthNum - 1]} ${parts[0]}`;
        }
        if (!monthlyCounts[monthLabel]) monthlyCounts[monthLabel] = { month: monthLabel, bookings: 0, guests: 0, revenue: 0 };
        monthlyCounts[monthLabel].bookings += 1;
        monthlyCounts[monthLabel].guests += guests;
        monthlyCounts[monthLabel].revenue += totalCost;
      }

      const rawTourName = (b.tour_name || 'Other').split(':').pop()?.trim() || 'Other';
      if (!tourCounts[rawTourName]) tourCounts[rawTourName] = { name: rawTourName, bookings: 0, guests: 0, revenue: 0 };
      tourCounts[rawTourName].bookings += 1;
      tourCounts[rawTourName].guests += guests;
      tourCounts[rawTourName].revenue += totalCost;

      if (statusCounts[st]) statusCounts[st].value += 1;
    });

    return {
      dailyTrends: Object.values(dailyCounts).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      weeklyTrends: Object.values(weeklyCounts).sort((a, b) => a.weekDate.getTime() - b.weekDate.getTime()),
      monthlyTrends: Object.values(monthlyCounts).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()),
      popularTours: Object.values(tourCounts).sort((a, b) => b.bookings - a.bookings).slice(0, 5),
      statusDistribution: Object.values(statusCounts).filter(s => s.value > 0),
      paymentDistribution: [
        { name: 'Collected', value: Math.round(collectedPaidRevenue), color: '#10B981' },
        { name: 'Pending Deposits', value: Math.round(pendingDepositsRevenue), color: '#F59E0B' },
        { name: 'Pending Balances', value: Math.round(pendingBalancesRevenue), color: '#3B82F6' }
      ],
      totalRevenue: calculatedRevenue,
      avgGuests: activeDashboardBookings.length > 0 ? (totalGuestsCount / activeDashboardBookings.length).toFixed(1) : '0',
      conversionRate: activeDashboardBookings.length > 0 ? ((confirmedCount / activeDashboardBookings.length) * 100).toFixed(0) : '0'
    };
  }, [activeDashboardBookings, confirmedCount]);

  return (
    <div className="space-y-6">
      <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {dashboardViewType === 'global' ? 'Global Operational Outlook' : 'Personal Sales Performance'}
          </span>
          <h3 className="text-xl font-bold text-white font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
            {dashboardViewType === 'global' ? 'Zanzibar HQ: Live Business Intelligence' : `${session?.name}'s Personal Performance Desk`}
          </h3>
          <p className="text-xs text-slate-400">
            {dashboardViewType === 'global' 
              ? 'Company-wide metrics, total receipts, conversion charts, and administrative yield projections.'
              : 'Your personal sales value, active conversions, passenger count, and daily/weekly/monthly quotas.'}
          </p>
        </div>

        {(session?.role === 'Administrator' || session?.role === 'Manager' || session?.role === 'Accountant' || session?.role === 'Marketing' || session?.role === 'Owner' || session?.role === 'Super Admin') && (
          <div className="bg-[#121B30] p-1 rounded-xl border border-white/5 flex gap-1 self-stretch md:self-auto shrink-0">
            <button
              onClick={() => setDashboardViewType('global')}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                dashboardViewType === 'global' ? 'bg-[#D4A017] text-[#020C1F]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={13} />
              <span>Global Outlook</span>
            </button>
            <button
              onClick={() => setDashboardViewType('personal')}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                dashboardViewType === 'personal' ? 'bg-[#D4A017] text-[#020C1F]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={13} />
              <span>My Performance</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Est. Ledger Gross', value: `$${chartData.totalRevenue.toLocaleString()}`, sub: 'Calculated from tours', color: 'text-[#D4A017]', border: 'hover:border-[#D4A017]/30' },
          { label: 'Conversion Index', value: `${chartData.conversionRate}%`, sub: 'Approved conversions', color: 'text-blue-400', border: 'hover:border-blue-500/30' },
          { label: 'Total Bookings', value: totalInquiriesCount, sub: 'Registered reservations', color: 'text-white', border: 'hover:border-white/10' },
          { label: 'Pending Attention', value: pendingCount, sub: 'Awaiting approval', color: 'text-[#D4A017]', border: 'hover:border-[#D4A017]/30' },
          { label: 'Approved / Confirmed', value: confirmedCount, sub: 'Locked departures', color: 'text-emerald-400', border: 'hover:border-emerald-500/30' },
          { label: 'Cumulative Headcount', value: totalTravelersCount, sub: 'Total guests supported', color: 'text-teal-400', border: 'hover:border-teal-500/30' },
          { label: 'Distinct Tourist Profiles', value: totalCustomersCount, sub: 'CRM traveler profiles', color: 'text-indigo-400', border: 'hover:border-indigo-500/30' },
          { label: 'Returning Customers', value: returningCustomersCount, sub: 'Repeat travelers', color: 'text-violet-400', border: 'hover:border-violet-500/30' }
        ].map((stat, i) => (
          <div key={i} className={`bg-[#0A1224] border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-sm transition-all ${stat.border}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{stat.label}</span>
            <p className={`text-2xl font-black font-mono my-1 ${stat.color}`}>{stat.value}</p>
            <div className="text-[9px] text-slate-500 font-medium">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D4A017]/10 rounded-xl text-[#D4A017]"><TrendingUp size={18} /></div>
            <div>
              <h3 className="text-sm font-black text-white">Visual Analytics & Ledger Trends</h3>
              <p className="text-[10px] text-slate-400">Dynamic travel demand and revenue projections.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#121B30] p-1 rounded-xl border border-white/5">
              {[
                { id: 'trends', label: 'Revenue Trends' },
                { id: 'payments', label: 'Payments' },
                { id: 'packages', label: 'Tours' },
                { id: 'statuses', label: 'Statuses' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setChartTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${chartTab === t.id ? 'bg-[#0B3B8C] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowCharts(!showCharts)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 border border-white/5">
              {showCharts ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {showCharts && (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === 'trends' ? (
                <AreaChart data={revenueInterval === 'daily' ? chartData.dailyTrends : revenueInterval === 'weekly' ? chartData.weeklyTrends : chartData.monthlyTrends}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4A017" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey={revenueInterval === 'daily' ? 'date' : revenueInterval === 'weekly' ? 'week' : 'month'} stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#121B30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#D4A017" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              ) : chartTab === 'payments' ? (
                <PieChart>
                  <Pie data={chartData.paymentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {chartData.paymentDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              ) : (
                <BarChart data={chartTab === 'packages' ? chartData.popularTours : chartData.statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#121B30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey={chartTab === 'packages' ? 'bookings' : 'value'} fill="#D4A017" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
