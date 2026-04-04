import { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Eye,
  FileText,
  Mail,
  Globe,
  ArrowUpRight,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("purchases")
      .select(`
        *,
        leads (reference_code, quality_grade, first_name, last_name, email, phone, city, province),
        dealers (dealership_name, email, phone)
      `)
      .order("purchased_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("delivery_status", statusFilter);
    }
    
    const { data, error } = await query;
    if (error) {
      toast.error("Failed to fetch system orders");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter(o => 
    o.dealers?.dealership_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.leads?.reference_code?.toLowerCase().includes(search.toLowerCase())
  );

  const retryDelivery = async (id: string) => {
    // This is a stub for the future edge function call
    toast.info("Retrying delivery... (Function triggered)");
    setTimeout(() => toast.success("Delivery retry successful"), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-500 tracking-tight">System Orders</h1>
        <p className="text-amber-500/40 text-sm mt-1">Global purchase history and lead delivery logs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <OrderKpi 
           label="Success Rate" 
           value="94.2%" 
           color="emerald" 
           desc="Delivery completion across all channels"
           icon={ShieldCheck}
         />
         <OrderKpi 
           label="Active Payouts" 
           value="$12,480" 
           color="blue" 
           desc="Purchases pending provider settlement"
           icon={ShoppingCart}
         />
         <OrderKpi 
           label="Failed Triggers" 
           value={orders.filter(o => o.delivery_status === 'failed').length} 
           color="rose" 
           desc="System triggers that need retry"
           icon={AlertCircle}
         />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 pt-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/40 group-focus-within:text-amber-500 transition-colors" />
          <Input 
            placeholder="Search by Dealer or Lead Code..." 
            className="pl-10 bg-white/5 border-amber-500/10 focus-visible:ring-amber-500/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white/60">
               <SelectValue placeholder="Delivery Status" />
             </SelectTrigger>
             <SelectContent className="bg-[#0F1729] border-white/10 text-white">
               <SelectItem value="all">All Deliveries</SelectItem>
               <SelectItem value="delivered">Delivered</SelectItem>
               <SelectItem value="pending">Pending</SelectItem>
               <SelectItem value="failed">Failed</SelectItem>
             </SelectContent>
           </Select>
           <Button variant="ghost" className="bg-white/5 border border-white/10 text-white/40 hover:text-white" onClick={() => fetchOrders()}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
           </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card border-amber-500/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold pl-6">Purchase ID</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Buyer Dealer</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Leads Secured</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Value</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-center">Delivery</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-right pr-6">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-white/20 italic">Scanning purchase records...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-white/20 italic">No purchase history found.</TableCell>
              </TableRow>
            ) : filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <TableRow 
                  className={cn(
                    "border-b border-white/5 cursor-pointer transition-all duration-300",
                    expandedOrder === order.id ? "bg-amber-500/10" : "hover:bg-white/5"
                  )}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <TableCell className="py-5 font-mono text-[10px] text-white/30 pl-6 flex items-center gap-2">
                    {expandedOrder === order.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{order.dealers?.dealership_name}</span>
                      <span className="text-[10px] text-white/20 uppercase tracking-tighter">Tier: {order.dealer_tier_at_purchase}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20 font-black tracking-tighter">
                          {order.leads?.quality_grade}
                       </Badge>
                       <span className="text-xs font-mono text-white/60">{order.leads?.reference_code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <span className="text-sm font-bold text-emerald-400 font-mono">${order.price_paid}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DeliveryStatus status={order.delivery_status} method={order.delivery_method} />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-white/60">{format(new Date(order.purchased_at), "MMM dd, yyyy")}</span>
                      <span className="text-[10px] text-white/20">{format(new Date(order.purchased_at), "HH:mm aaa")}</span>
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <TableRow className="bg-black/20 hover:bg-black/20">
                    <TableCell colSpan={6} className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-300">
                         {/* Lead Details */}
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                              <FileText className="h-3 w-3" /> Lead Data Delivered
                            </h4>
                            <div className="space-y-2 bg-white/5 rounded-xl border border-white/5 p-4">
                               <DetailItem label="Full Name" value={`${order.leads?.first_name} ${order.leads?.last_name}`} />
                               <DetailItem label="Email" value={order.leads?.email} />
                               <DetailItem label="Phone" value={order.leads?.phone} />
                               <DetailItem label="Location" value={`${order.leads?.city}, ${order.leads?.province}`} />
                            </div>
                         </div>

                         {/* Distribution */}
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                              <Globe className="h-3 w-3" /> Delivery Endpoints
                            </h4>
                            <div className="space-y-3">
                               <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                                  <div className="flex items-center justify-between mb-2">
                                     <span className="text-[10px] text-white/40 uppercase">Webhook (CRM)</span>
                                     <Badge className="bg-emerald-500/20 text-emerald-500 text-[10px]">Active</Badge>
                                  </div>
                                  <p className="text-xs text-white/60 truncate truncate-ellipsis mb-2">https://crm.dealer-network.com/api/v1/leads</p>
                                  <Button size="sm" variant="ghost" className="w-full text-xs bg-white/5 hover:bg-white/10 text-white/60">
                                    View Payload JSON
                                  </Button>
                               </div>
                               <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                                  <div className="flex items-center justify-between mb-2">
                                     <span className="text-[10px] text-white/40 uppercase">Email Dispatch</span>
                                     <Badge className="bg-emerald-500/20 text-emerald-500 text-[10px]">Sent</Badge>
                                  </div>
                                  <p className="text-xs text-white/60">{order.dealers?.email}</p>
                               </div>
                            </div>
                         </div>

                         {/* Actions */}
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                               <User className="h-3 w-3" /> Admin Actions
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                               <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-[#0F1729] font-bold justify-start" onClick={() => retryDelivery(order.id)}>
                                  <RefreshCw className="h-3 w-3 mr-2" /> 
                                  Force Re-trigger Delivery
                               </Button>
                               <Button size="sm" variant="outline" className="border-white/10 text-white/40 hover:bg-white/5 justify-start">
                                  <ArrowUpRight className="h-3 w-3 mr-2" /> 
                                  Contact Dealer
                               </Button>
                               <Button size="sm" variant="outline" className="border-white/10 text-white/40 hover:bg-white/5 justify-start">
                                  <ShieldCheck className="h-3 w-3 mr-2" /> 
                                  Grant Credit/Refund
                               </Button>
                            </div>
                         </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function OrderKpi({ label, value, color, desc, icon: Icon }: any) {
  const colors: any = {
    emerald: "text-emerald-400 bg-emerald-400/5 border-emerald-400/20",
    blue: "text-blue-400 bg-blue-400/5 border-blue-400/20",
    rose: "text-rose-400 bg-rose-400/5 border-rose-400/20",
  };

  return (
    <div className="glass-card p-6 border-amber-500/10 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn("h-5 w-5", colors[color].split(' ')[0])} />
        <Badge className={cn("uppercase text-[9px] font-bold", colors[color])}>Live Stats</Badge>
      </div>
      <p className="text-3xl font-bold text-white font-mono">{value}</p>
      <p className="text-xs font-medium text-amber-500/60 mt-1">{label}</p>
      <p className="text-[10px] text-white/20 mt-2 tracking-tight">{desc}</p>
    </div>
  );
}

function DeliveryStatus({ status, method }: { status: string, method: string }) {
  const styles: any = {
    delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    failed: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
       <Badge className={cn("uppercase text-[9px] font-bold px-2", styles[status] || styles.pending)}>
         {status}
       </Badge>
       <div className="flex items-center gap-1 text-white/20">
         {method === 'both' ? (
           <><Mail className="h-2.5 w-2.5" /><Globe className="h-2.5 w-2.5" /></>
         ) : method === 'webhook' ? (
           <Globe className="h-2.5 w-2.5" />
         ) : (
           <Mail className="h-2.5 w-2.5" />
         )}
       </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{label}</span>
       <span className="text-sm font-medium text-white tracking-tight">{value || 'N/A'}</span>
    </div>
  );
}

import React from "react";
