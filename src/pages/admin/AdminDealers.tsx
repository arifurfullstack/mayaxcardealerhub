import { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreHorizontal, 
  CreditCard, 
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Mail,
  Phone,
  LayoutGrid,
  User
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDealers() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modals state
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  
  // Form states
  const [rejectionReason, setRejectionReason] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletNote, setWalletNote] = useState("");
  const [newTier, setNewTier] = useState("");

  const fetchDealers = async () => {
    setLoading(true);
    let query = supabase
      .from("dealers")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("approval_status", statusFilter);
    }
    
    const { data, error } = await query;
    if (error) {
      toast.error("Failed to fetch dealers");
    } else {
      setDealers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDealers();
  }, [statusFilter]);

  const filteredDealers = dealers.filter(d => 
    d.dealership_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = async (dealerId: string, status: string, reason = "") => {
    const { error } = await supabase
      .from("dealers")
      .update({ 
        approval_status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", dealerId);

    if (error) {
      toast.error(`Failed to update status to ${status}`);
    } else {
      toast.success(`Dealer status updated to ${status}`);
      fetchDealers();
      setIsRejectModalOpen(false);
    }
  };

  const handleAdjustWallet = async () => {
    if (!selectedDealer || !walletAmount) return;
    
    const amountNum = parseFloat(walletAmount);
    const newBalance = Number(selectedDealer.wallet_balance) + amountNum;

    // 1. Record transaction
    const { error: transError } = await supabase.from("wallet_transactions").insert({
      dealer_id: selectedDealer.id,
      type: amountNum >= 0 ? "top_up" : "refund",
      amount: amountNum,
      balance_after: newBalance,
      description: walletNote || (amountNum >= 0 ? "Admin manual top-up" : "Admin manual debit")
    });

    if (transError) {
       toast.error("Failed to record transaction");
       return;
    }

    // 2. Update balance
    const { error: balanceError } = await supabase
      .from("dealers")
      .update({ wallet_balance: newBalance })
      .eq("id", selectedDealer.id);

    if (balanceError) {
      toast.error("Failed to update dealer balance");
    } else {
      toast.success(`Wallet adjusted by $${amountNum}`);
      fetchDealers();
      setIsWalletModalOpen(false);
      setWalletAmount("");
      setWalletNote("");
    }
  };

  const handleUpdateTier = async () => {
    if (!selectedDealer || !newTier) return;
    
    const { error } = await supabase
      .from("dealers")
      .update({ subscription_tier: newTier })
      .eq("id", selectedDealer.id);

    if (error) {
      toast.error("Failed to update tier");
    } else {
      toast.success(`Tier updated to ${newTier.toUpperCase()}`);
      fetchDealers();
      setIsTierModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Dealer Management</h1>
          <p className="text-amber-500/40 text-sm mt-1">Review registrations, manage statuses, and adjust accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold px-3 py-1">
             {dealers.filter(d => d.approval_status === 'pending').length} Pending Requests
          </Badge>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/40 group-focus-within:text-amber-500 transition-colors" />
          <Input 
            placeholder="Search by name, email, or contact..." 
            className="pl-10 bg-white/5 border-amber-500/10 focus-visible:ring-amber-500/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected", "suspended"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-300",
                statusFilter === status 
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-500" 
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card border-amber-500/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Dealership</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Contact Info</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-center">Tier</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-right">Wallet</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-center">Status</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-right pr-6">Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-white/20 italic">Loading dealers...</TableCell>
              </TableRow>
            ) : filteredDealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-white/20 italic">No dealers found matching your filters.</TableCell>
              </TableRow>
            ) : filteredDealers.map((dealer) => (
              <TableRow key={dealer.id} className="border-b border-white/5 hover:bg-amber-500/5 transition-colors group">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white group-hover:text-amber-200 transition-colors">{dealer.dealership_name}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-tighter">{dealer.business_type} • {dealer.province}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <User className="h-3 w-3 text-amber-500/40" />
                        {dealer.contact_person}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <Mail className="h-3 w-3 text-amber-500/20" />
                        {dealer.email}
                      </div>
                   </div>
                </TableCell>
                <TableCell className="text-center">
                   <Badge className={cn(
                     "uppercase text-[10px] font-bold",
                     dealer.subscription_tier === 'vip' ? "bg-amber-500/20 text-amber-500" :
                     dealer.subscription_tier === 'elite' ? "bg-blue-500/20 text-blue-500" :
                     dealer.subscription_tier === 'pro' ? "bg-cyan-500/20 text-cyan-500" :
                     "bg-white/10 text-white/40"
                   )}>
                     {dealer.subscription_tier || 'none'}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-mono font-bold text-amber-200">${Number(dealer.wallet_balance).toFixed(2)}</span>
                </TableCell>
                <TableCell className="text-center">
                   <StatusBadge status={dealer.approval_status} />
                </TableCell>
                <TableCell className="text-right pr-6">
                   <span className="text-xs text-white/30">{format(new Date(dealer.created_at), "MMM dd, yyyy")}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-white/30 hover:text-amber-500 hover:bg-amber-500/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#0F1729] border-white/10 text-white">
                      <DropdownMenuLabel className="text-xs font-bold text-amber-500/60 uppercase">Management</DropdownMenuLabel>
                      
                      {dealer.approval_status !== 'approved' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(dealer.id, 'approved')} className="gap-2 cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Approve Dealer
                        </DropdownMenuItem>
                      )}
                      
                      {(dealer.approval_status === 'pending' || dealer.approval_status === 'approved') && (
                        <DropdownMenuItem onClick={() => { setSelectedDealer(dealer); setIsRejectModalOpen(true); }} className="gap-2 cursor-pointer focus:bg-rose-500/20 focus:text-rose-400">
                          <XCircle className="h-4 w-4" /> Reject Registration
                        </DropdownMenuItem>
                      )}

                      {dealer.approval_status === 'approved' ? (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(dealer.id, 'suspended')} className="gap-2 cursor-pointer focus:bg-orange-500/20 focus:text-orange-400">
                          <AlertCircle className="h-4 w-4" /> Suspend Account
                        </DropdownMenuItem>
                      ) : dealer.approval_status === 'suspended' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(dealer.id, 'approved')} className="gap-2 cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-400">
                          <ShieldAlert className="h-4 w-4" /> Restore Access
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuLabel className="text-xs font-bold text-amber-500/60 uppercase">Finance & Tier</DropdownMenuLabel>
                      
                      <DropdownMenuItem onClick={() => { setSelectedDealer(dealer); setIsWalletModalOpen(true); }} className="gap-2 cursor-pointer focus:bg-amber-500/20 focus:text-amber-400">
                        <CreditCard className="h-4 w-4" /> Adjust Balance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedDealer(dealer); setIsTierModalOpen(true); }} className="gap-2 cursor-pointer focus:bg-amber-500/20 focus:text-amber-400">
                        <LayoutGrid className="h-4 w-4" /> Change Subscription
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="bg-[#0F1729] border-rose-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-rose-500 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> 
              Reject Dealer Registration
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Provide a reason for rejection. This will be shown to the dealer when they try to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-white/60">Rejection Reason</Label>
              <Textarea 
                placeholder="e.g. Invalid business documentation, unverifiable address..." 
                className="bg-white/5 border-white/10 h-32 focus:border-rose-500/50 transition-colors"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={() => handleUpdateStatus(selectedDealer?.id, 'rejected', rejectionReason)}
              disabled={!rejectionReason}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet Modal */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="bg-[#0F1729] border-amber-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-500 flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> 
              Adjust Wallet Balance
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Directly credit or debit this dealer's wallet. Current: ${selectedDealer?.wallet_balance}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-white/60">Adjustment Amount ($)</Label>
              <Input 
                type="number"
                placeholder="e.g. 100 or -50" 
                className="bg-white/5 border-white/10 focus:border-amber-500/50 transition-colors"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
              />
              <p className="text-[10px] text-amber-500/40">Use positive numbers for deposits, negative for deductions.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-white/60">Note/Description</Label>
              <Input 
                placeholder="e.g. Manual top-up for overage payout" 
                className="bg-white/5 border-white/10 focus:border-amber-500/50 transition-colors"
                value={walletNote}
                onChange={(e) => setWalletNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsWalletModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-[#0F1729] font-bold"
              onClick={handleAdjustWallet}
              disabled={!walletAmount}
            >
              Update Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Modal */}
      <Dialog open={isTierModalOpen} onOpenChange={setIsTierModalOpen}>
        <DialogContent className="bg-[#0F1729] border-amber-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-500 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" /> 
              Change Subscription Tier
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Override the current tier for {selectedDealer?.dealership_name}. Current: {selectedDealer?.subscription_tier}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-6">
            {['none', 'basic', 'pro', 'elite', 'vip'].map(tier => (
              <button
                key={tier}
                onClick={() => setNewTier(tier)}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 uppercase font-black tracking-tighter text-sm",
                  newTier === tier 
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400 scale-105" 
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                )}
              >
                {tier}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTierModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-[#0F1729] font-bold"
              onClick={handleUpdateTier}
              disabled={!newTier}
            >
              Save Tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    <Badge className={cn("uppercase text-[10px] font-bold", styles[status] || styles.pending)}>
      {status}
    </Badge>
  );
}
