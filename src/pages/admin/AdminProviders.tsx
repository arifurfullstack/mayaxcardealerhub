import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreHorizontal, 
  HandCoins,
  Percent,
  Warehouse,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Mail,
  User,
  ExternalLink
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [newCommission, setNewCommission] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, payoutsRes] = await Promise.all([
      supabase.from("provider_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("provider_payouts").select(`
        *,
        provider:provider_profiles(company_name, email)
      `).order("requested_at", { ascending: false })
    ]);

    if (profilesRes.error) toast.error("Failed to fetch providers");
    else setProviders(profilesRes.data || []);
    
    if (payoutsRes.error) toast.error("Failed to fetch payouts");
    else setPayouts(payoutsRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("provider_profiles")
      .update({ approval_status: status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) toast.error(`Failed to ${status} provider`);
    else {
      toast.success(`Provider status updated to ${status}`);
      fetchData();
    }
  };

  const handleUpdateCommission = async () => {
    if (!selectedProvider || !newCommission) return;
    const rate = parseFloat(newCommission) / 100;
    
    const { error } = await supabase
      .from("provider_profiles")
      .update({ commission_rate: rate })
      .eq("id", selectedProvider.id);

    if (error) toast.error("Failed to update commission rate");
    else {
      toast.success(`Commission set to ${newCommission}%`);
      setIsCommissionModalOpen(false);
      fetchData();
    }
  };

  const handleProcessPayout = async (payout: any, status: 'paid' | 'failed') => {
    const { error } = await supabase
      .from("provider_payouts")
      .update({ 
        status, 
        processed_at: new Date().toISOString()
      })
      .eq("id", payout.id);

    if (error) toast.error("Failed to update payout status");
    else {
      toast.success(`Payout marked as ${status}`);
      fetchData();
    }
  };

  const filteredProviders = providers.filter(p => 
    p.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Lead Provider Management</h1>
        <p className="text-amber-500/40 text-sm mt-1">Onboard suppliers, set commissions, and handle payout settlements</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-white/5 border border-white/5 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-500 data-[state=active]:text-[#0F1729] font-bold text-[10px] uppercase">All Profiles</TabsTrigger>
            <TabsTrigger value="payouts" className="data-[state=active]:bg-amber-500 data-[state=active]:text-[#0F1729] font-bold text-[10px] uppercase flex gap-2">
              Payout Requests
              {payouts.filter(p => p.status === 'pending').length > 0 && (
                <span className="bg-rose-500 text-white px-1.5 rounded-full text-[9px] animate-pulse">
                  {payouts.filter(p => p.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="relative group min-w-[300px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/40 group-focus-within:text-amber-500 transition-colors" />
             <Input 
               placeholder="Search by Company or Admin..." 
               className="pl-10 h-9 bg-white/5 border-amber-500/10 focus-visible:ring-amber-500/30"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>

        <TabsContent value="all" className="space-y-6 m-0 animate-in fade-in">
          {/* Provider Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <ProviderKpi label="Active Sources" value={providers.filter(p => p.approval_status === 'approved').length} icon={Warehouse} color="amber" />
             <ProviderKpi label="Unsettled Earnings" value={`$${providers.reduce((acc, p) => acc + Number(p.pending_payout), 0).toLocaleString()}`} icon={HandCoins} color="emerald" />
             <ProviderKpi label="Avg Commission" value="20.5%" icon={Percent} color="blue" />
             <ProviderKpi label="Settled Volume" value={`$${providers.reduce((acc, p) => acc + Number(p.total_earnings), 0).toLocaleString()}`} icon={TrendingUp} color="emerald" />
          </div>

          {/* Table */}
          <div className="glass-card border-amber-500/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold pl-6">Company / Provider</TableHead>
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Performance</TableHead>
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-center">Commission</TableHead>
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-center">Status</TableHead>
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-right pr-6">Activity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-48 text-center text-white/20 italic">Loading providers...</TableCell></TableRow>
                ) : filteredProviders.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-48 text-center text-white/20 italic">No providers found.</TableCell></TableRow>
                ) : filteredProviders.map((p) => (
                  <TableRow key={p.id} className="border-b border-white/5 hover:bg-amber-500/5 transition-colors group">
                    <TableCell className="py-4 pl-6">
                       <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center font-bold text-amber-500">
                             {p.company_name?.slice(0,1)}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-white group-hover:text-amber-200 transition-colors uppercase tracking-tight">{p.company_name}</span>
                             <div className="flex items-center gap-1.5 mt-0.5">
                                <Mail className="h-2.5 w-2.5 text-white/20" />
                                <span className="text-[10px] text-white/30">{p.email}</span>
                             </div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-emerald-400 font-mono">${Number(p.pending_payout).toFixed(2)}</span>
                             <span className="text-[10px] text-white/20 font-bold uppercase">Pending</span>
                          </div>
                          <p className="text-[9px] text-white/20 mt-1 uppercase tracking-widest">Total Earned: ${Number(p.total_earnings).toFixed(0)}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20 font-black tracking-tighter">
                          {Math.round(p.commission_rate * 100)}%
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <StatusBadge status={p.approval_status} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <div className="flex flex-col items-end">
                          <span className="text-xs text-white/60 font-medium">Synced {format(new Date(p.created_at), "MMM d")}</span>
                          <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold tracking-tighter mt-1">
                             <ShieldCheck className="h-2 w-2" />
                             FULLY SCRUTINIZED
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-white/30 hover:text-amber-500 hover:bg-amber-500/10">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#0F1729] border-white/10 text-white">
                          <DropdownMenuLabel className="text-[10px] uppercase font-bold text-amber-500/60">Risk Operations</DropdownMenuLabel>
                          {p.approval_status !== 'approved' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'approved')} className="gap-2 focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer">
                              <CheckCircle2 className="h-4 w-4" /> Approve Supplier
                            </DropdownMenuItem>
                          )}
                          {p.approval_status === 'approved' ? (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'suspended')} className="gap-2 focus:bg-orange-500/20 focus:text-orange-400 cursor-pointer">
                              <AlertCircle className="h-4 w-4" /> Suspend Provider
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'approved')} className="gap-2 focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer">
                              <CheckCircle2 className="h-4 w-4" /> Lift Suspension
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'rejected')} className="gap-2 focus:bg-rose-500/20 focus:text-rose-400 cursor-pointer">
                            <XCircle className="h-4 w-4" /> Full Denylist
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuLabel className="text-[10px] uppercase font-bold text-amber-500/60">Configurations</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setSelectedProvider(p); setNewCommission((p.commission_rate * 100).toString()); setIsCommissionModalOpen(true); }} className="gap-2 cursor-pointer focus:bg-amber-500/20">
                            <Percent className="h-4 w-4" /> Adjust Commission
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-white/10">
                            <ExternalLink className="h-4 w-4" /> View Provider Portal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="animate-in fade-in m-0">
           {/* Payouts Table */}
           <div className="glass-card border-amber-500/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold pl-6">Request ID</TableHead>
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Lead Source</TableHead>
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Settlement Sum</TableHead>
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Volume</TableHead>
                  <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-center">Payout Status</TableHead>
                  <TableHead className="w-[100px] text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-48 text-center text-white/20 italic">No payout requests found.</TableCell></TableRow>
                ) : payouts.map((payout) => (
                  <TableRow key={payout.id} className="border-b border-white/5 transition-colors group">
                    <TableCell className="py-4 pl-6">
                       <div className="flex flex-col">
                          <span className="text-xs text-white/60 font-mono tracking-tight uppercase">PO-{payout.id.slice(0, 6)}</span>
                          <span className="text-[10px] text-white/20">{format(new Date(payout.requested_at), "MMM d, HH:mm")}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-white tracking-tight">{payout.provider?.company_name}</span>
                          <span className="text-[10px] text-white/20 uppercase tracking-widest">{payout.provider?.email}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-emerald-400 font-mono">${Number(payout.amount).toLocaleString()}</span>
                          <ArrowUpRight className="h-3 w-3 text-white/20 rotate-45" />
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs font-bold text-amber-500/60 font-mono">{payout.leads_count} Leads</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn(
                         "uppercase text-[9px] font-bold",
                         payout.status === 'paid' ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20" :
                         payout.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                         "bg-rose-500/10 text-rose-500 border-rose-500/20"
                       )}>
                         {payout.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       {payout.status === 'pending' && (
                         <Button 
                           size="sm" 
                           onClick={() => handleProcessPayout(payout, 'paid')}
                           className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] h-7 gap-1.5"
                         >
                            <HandCoins className="h-3 w-3" /> Mark Settled
                         </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Commission Modal */}
      <Dialog open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen}>
        <DialogContent className="bg-[#0F1729] border-amber-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-500 flex items-center gap-2">
              <Percent className="h-5 w-5" /> 
              Supplier Commission Overdrive
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Update the revenue share for {selectedProvider?.company_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-8">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-white/60">New Commission Rate (%)</Label>
              <div className="relative">
                <Input 
                   type="number"
                   value={newCommission}
                   onChange={(e) => setNewCommission(e.target.value)}
                   className="bg-white/5 border-amber-500/10 text-xl font-bold font-mono h-14 pl-4 pr-12 focus:border-amber-500/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 font-bold text-xl">%</span>
              </div>
              <p className="text-[10px] text-white/30 italic">Platform average is 20%. Higher rates incentivize better quality leads.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCommissionModalOpen(false)}>Cancel Settings</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-[#0F1729] font-bold px-8 shadow-lg shadow-amber-500/20" onClick={handleUpdateCommission}>
               Apply to Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function ProviderKpi({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    amber: "text-amber-400 bg-amber-400/5 border-amber-400/20",
    emerald: "text-emerald-400 bg-emerald-400/5 border-emerald-400/20",
    blue: "text-blue-400 bg-blue-400/5 border-blue-400/20",
  };

  return (
    <div className="glass-card p-6 border-amber-500/10 flex flex-col gap-1 transition-all duration-300 hover:border-amber-500/30">
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn("h-5 w-5", colors[color].split(' ')[0])} />
        <Clock className="h-3 w-3 text-white/10" />
      </div>
      <p className="text-3xl font-bold text-white font-mono tracking-tighter leading-none">{value}</p>
      <p className="text-[10px] font-bold text-amber-500/60 mt-1 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    suspended: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  return (
    <Badge className={cn("uppercase text-[9px] font-bold tracking-tighter", styles[status] || styles.pending)}>
      {status}
    </Badge>
  );
}
