import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Clock,
  ArrowRightLeft,
  Building2,
  DollarSign,
  TrendingUp,
  Download,
  MoreVertical,
  Banknote,
  MinusCircle,
  PlusCircle,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState<any>({
     totalDeposits: 0,
     totalSpend: 0,
     netBalance: 0
  });

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from("wallet_transactions")
      .select(`
        *,
        dealers (dealership_name, email)
      `)
      .order("created_at", { ascending: false });

    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }
    
    const { data, error } = await query;
    if (error) {
      toast.error("Failed to fetch ledger data");
    } else {
      setTransactions(data || []);
      
      // Calculate Stats
      const deposits = data?.filter(t => t.type === 'top_up').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const spend = data?.filter(t => t.type === 'purchase').reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0) || 0;
      setStats({
         totalDeposits: deposits,
         totalSpend: spend,
         netBalance: deposits - spend
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  const filtered = transactions.filter(t => 
    t.dealers?.dealership_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.reference_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Transaction Ledger</h1>
          <p className="text-amber-500/40 text-sm mt-1">Platform-wide financial flow and dealer wallet activity</p>
        </div>
        <Button variant="outline" className="border-white/10 text-white/40 hover:bg-white/5 hover:text-white h-9 gap-2">
           <Download className="h-4 w-4" />
           Export CSV
        </Button>
      </div>

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <FinanceCard 
            label="Total Deposits" 
            value={`$${stats.totalDeposits.toLocaleString()}`} 
            icon={PlusCircle} 
            color="emerald" 
            desc="Gross inflow from top-ups"
         />
         <FinanceCard 
            label="Total Purchase Value" 
            value={`$${stats.totalSpend.toLocaleString()}`} 
            icon={MinusCircle} 
            color="rose" 
            desc="Outflow into lead inventory"
         />
         <FinanceCard 
            label="Platform Liquidity" 
            value={`$${stats.netBalance.toLocaleString()}`} 
            icon={Banknote} 
            color="amber" 
            desc="Net remaining dealer balances"
         />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 pt-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/40 group-focus-within:text-amber-500 transition-colors" />
          <Input 
            placeholder="Search by Dealership or Description..." 
            className="pl-10 bg-white/5 border-amber-500/10 focus-visible:ring-amber-500/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Select value={typeFilter} onValueChange={setTypeFilter}>
             <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white/60">
               <SelectValue placeholder="Transaction Type" />
             </SelectTrigger>
             <SelectContent className="bg-[#0F1729] border-white/10 text-white">
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="top_up">Top-Ups (Deposits)</SelectItem>
                <SelectItem value="purchase">Lead Purchases</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
                <SelectItem value="adjustment">Manual Adjustments</SelectItem>
             </SelectContent>
           </Select>
           <Button variant="ghost" className="bg-white/5 border border-white/10 text-white/40 hover:text-white" onClick={() => fetchTransactions()}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
           </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card border-amber-500/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold pl-6">Timestamp / Seq</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Party (Dealer)</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Activity Description</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-center">Type</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-right">Amount</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-right pr-6">Post-Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-white/20 italic">Loading financial data...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-white/20 italic">No transactions found.</TableCell>
              </TableRow>
            ) : filtered.map((tx) => (
              <TableRow key={tx.id} className="border-b border-white/5 hover:bg-amber-500/5 transition-colors group">
                <TableCell className="py-4 pl-6">
                   <div className="flex flex-col">
                      <span className="text-xs text-white/60 font-medium">[{tx.id.slice(0, 4)}] {format(new Date(tx.created_at), "MMM d, HH:mm")}</span>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">{tx.id.slice(-8).toUpperCase()}</p>
                   </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white tracking-tight">{tx.dealers?.dealership_name || tx.buyer_user_id?.slice(0,8)}</span>
                    <span className="text-[10px] text-white/20 uppercase font-mono">{tx.dealers?.email || "EXTERNAL_PAYMENT"}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <p className="text-xs text-white/60 line-clamp-1">{tx.description}</p>
                   {tx.reference_id && (
                     <div className="flex items-center gap-1.5 mt-1 text-[9px] text-white/20 font-mono">
                        <ArrowRightLeft className="h-2 w-2" />
                        REF: {tx.reference_id.toUpperCase()}
                     </div>
                   )}
                </TableCell>
                <TableCell className="text-center">
                   <TypeBadge type={tx.type} />
                </TableCell>
                <TableCell className="text-right">
                   <span className={cn(
                     "text-sm font-bold font-mono",
                     Number(tx.amount) >= 0 ? "text-emerald-400" : "text-rose-400"
                   )}>
                      {Number(tx.amount) >= 0 ? "+" : ""}{tx.amount}
                   </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                   <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-amber-500/60 font-mono">${tx.balance_after}</span>
                      <div className="flex items-center gap-1 text-[9px] text-white/10 uppercase font-bold tracking-tighter">
                         <ShieldCheck className="h-2 w-2" />
                         Audited
                      </div>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FinanceCard({ label, value, icon: Icon, color, desc }: any) {
  const colorStyles: any = {
     emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
     rose: "text-rose-400 bg-rose-400/10 border-rose-400/20",
     amber: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  };

  return (
    <div className="glass-card p-6 border-amber-500/10 flex flex-col gap-2 group hover:scale-[1.02] transition-transform duration-500">
      <div className="flex items-center justify-between mb-2">
         <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", colorStyles[color])}>
           <Icon className="h-5 w-5 shadow-lg" />
         </div>
      </div>
      <p className="text-2xl font-black text-white font-mono tracking-tight leading-none">{value}</p>
      <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-1">{label}</p>
      <p className="text-[9px] text-white/20 uppercase tracking-tighter mt-1">{desc}</p>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const types: any = {
    top_up: "bg-emerald-500/20 text-emerald-500 border-emerald-500/20",
    purchase: "bg-blue-500/20 text-blue-500 border-blue-500/20",
    refund: "bg-rose-500/20 text-rose-500 border-rose-500/20",
    adjustment: "bg-amber-500/20 text-amber-500 border-amber-500/20",
  };

  return (
    <Badge className={cn("uppercase text-[9px] font-bold tracking-tighter px-2", types[type] || "bg-white/10 text-white/40")}>
      {type?.replace('_', ' ')}
    </Badge>
  );
}
