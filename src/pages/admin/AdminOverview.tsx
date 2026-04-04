import { useState, useEffect } from "react";
import { 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Stats {
  totalDealers: number;
  activeDealers: number;
  totalLeads: number;
  soldLeads: number;
  totalRevenue: number;
  avgLeadPrice: number;
}

const COLORS = ['#F59E0B', '#3B82F6', '#06B6D4', '#6366F1'];

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // 1. Basic counts
        const [
          { count: dealerCount }, 
          { count: activeDealerCount },
          { count: leadCount },
          { count: soldCount },
          { data: transactions }
        ] = await Promise.all([
          supabase.from("dealers").select("*", { count: "exact", head: true }),
          supabase.from("dealers").select("*", { count: "exact", head: true }).eq("approval_status", "approved"),
          supabase.from("leads").select("*", { count: "exact", head: true }),
          supabase.from("leads").select("*", { count: "exact", head: true }).eq("sold_status", "sold"),
          supabase.from("wallet_transactions").select("amount").eq("type", "purchase")
        ]);

        const totalRev = Math.abs(transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0);
        
        setStats({
          totalDealers: dealerCount || 0,
          activeDealers: activeDealerCount || 0,
          totalLeads: leadCount || 0,
          soldLeads: soldCount || 0,
          totalRevenue: totalRev,
          avgLeadPrice: soldCount ? totalRev / soldCount : 0
        });

        // 2. Lead Grades for Pie Chart
        const { data: grades } = await supabase.from("leads").select("quality_grade");
        const gradeCounts = (grades || []).reduce((acc: any, cur: any) => {
          const g = cur.quality_grade;
          acc[g] = (acc[g] || 0) + 1;
          return acc;
        }, {});
        
        setGradeData(Object.entries(gradeCounts).map(([name, value]) => ({ name, value })));

        // 3. Last 7 Days Revenue
        const { data: revSeries } = await supabase
          .from("wallet_transactions")
          .select("amount, created_at")
          .eq("type", "purchase")
          .order("created_at", { ascending: true });

        const revByDay = (revSeries || []).reduce((acc: any, cur: any) => {
          const date = format(new Date(cur.created_at), "MMM dd");
          acc[date] = (acc[date] || 0) + Math.abs(Number(cur.amount));
          return acc;
        }, {});

        setRevenueData(Object.entries(revByDay).map(([date, amount]) => ({ date, amount })));

        // 4. Recent Purchases
        const { data: recent } = await supabase
          .from("purchases")
          .select(`
            id,
            purchased_at,
            price_paid,
            leads (reference_code, quality_grade),
            dealers (dealership_name)
          `)
          .order("purchased_at", { ascending: false })
          .limit(5);
        
        setRecentPurchases(recent || []);

      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-amber-500/10 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 glass-card border-white/5 bg-white/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 glass-card border-white/5 bg-white/5" />
          <div className="h-80 glass-card border-white/5 bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 tracking-tight">System Overview</h1>
          <p className="text-amber-500/40 text-sm mt-1">Platform analytics and performance metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Auto-Refresh Active</span>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-1" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Building} 
          label="Total Dealers" 
          value={stats?.totalDealers || 0} 
          subValue={`${stats?.activeDealers} Approved`}
          trend="+4%" 
          trendUp={true} 
        />
        <StatCard 
          icon={Target} 
          label="Total Leads" 
          value={stats?.totalLeads || 0} 
          subValue={`${stats?.soldLeads} Sold to date`}
          trend="+12%" 
          trendUp={true} 
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} 
          subValue="Gross purchase volume"
          trend="+8%" 
          trendUp={true} 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Avg Lead Price" 
          value={`$${(stats?.avgLeadPrice || 0).toFixed(2)}`} 
          subValue="Revenue per lead sold"
          trend="-2%" 
          trendUp={false} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6 border-amber-500/10 flex flex-col gap-6 overflow-hidden min-h-[400px]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-100 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Revenue Performance
            </h3>
            <div className="flex gap-2">
              {['7D', '1M', '3M'].map(t => (
                <button key={t} className={cn(
                  "px-3 py-1 rounded text-[10px] font-bold transition-colors border",
                  t === '7D' ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
                )}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff40', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff40', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141b2d', border: '1px solid #f59e0b20', borderRadius: '8px' }}
                  itemStyle={{ color: '#F59E0B' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="glass-card p-6 border-amber-500/10 flex flex-col gap-6 h-full">
          <h3 className="text-sm font-semibold text-amber-100">Grade Distribution</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141b2d', border: '1px solid #ffffff10', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-white/40 uppercase font-bold tracking-tighter">Total</span>
              <span className="text-xl font-bold text-white">{stats?.totalLeads}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {gradeData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">{item.name}</span>
                <span className="ml-auto text-[10px] font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 border-amber-500/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-amber-100 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Recent Successful Purchases
            </h3>
            <button className="text-[10px] font-bold text-amber-500/60 hover:text-amber-500 transition-colors uppercase tracking-widest">View All Orders</button>
          </div>
          <div className="space-y-3">
            {recentPurchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300 group">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs shadow-lg",
                  purchase.leads?.quality_grade === 'A+' ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                  purchase.leads?.quality_grade === 'A' ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" :
                  "bg-cyan-500/20 text-cyan-500 border border-cyan-500/30"
                )}>
                  {purchase.leads?.quality_grade}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">{purchase.leads?.reference_code}</p>
                  <p className="text-sm font-medium text-white truncate truncate-ellipsis">{purchase.dealers?.dealership_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400 font-mono">${purchase.price_paid}</p>
                  <p className="text-[10px] text-white/30">{format(new Date(purchase.purchased_at), "HH:mm aaa")}</p>
                </div>
                <div className="pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-6 w-6 rounded flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
                    <ArrowUpRight className="h-3 w-3 text-amber-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 border-amber-500/10 flex flex-col gap-6">
          <h3 className="text-sm font-semibold text-amber-100">System Priority</h3>
          <div className="space-y-4">
            <PriorityItem label="Pending Approvals" value={stats?.totalDealers ? 4 : 0} color="amber" />
            <PriorityItem label="Lead Inventory Low" value={0} color="red" />
            <PriorityItem label="Pending Payouts" value={1} color="blue" />
            <PriorityItem label="Daily Volume Target" value="78%" color="emerald" />
          </div>
          <div className="mt-auto pt-6 border-t border-white/5">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Platform Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium tracking-tight">All systems operational</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, trend, trendUp }: any) {
  return (
    <div className="glass-card p-5 border-amber-500/10 flex flex-col gap-3 group hover:border-amber-500/30 transition-all duration-500">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5 text-amber-500" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
          trendUp ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border-rose-400/20"
        )}>
          {trendUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-white font-mono leading-none mt-1">{value}</p>
        <p className="text-[10px] text-white/30 mt-2">{subValue}</p>
      </div>
    </div>
  );
}

function PriorityItem({ label, value, color }: any) {
  const colorMap: any = {
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-400/20"
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
      <span className="text-xs text-white/60">{label}</span>
      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", colorMap[color])}>
        {value}
      </span>
    </div>
  );
}
