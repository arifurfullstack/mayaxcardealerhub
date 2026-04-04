import { useState, useEffect } from "react";
import { 
  Tag, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XSquare,
  ShieldCheck,
  Eye,
  ArrowUpDown,
  MapPin,
  BadgeDollarSign,
  FileCheck2,
  BrainCircuit
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Lead Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    reference_code: "",
    initials: "",
    buyer_type: "online",
    city: "",
    province: "",
    credit_range_min: 500,
    credit_range_max: 600,
    income: "",
    vehicle_preference: "",
    price: 45,
    ai_score: 75,
    quality_grade: "A",
    has_drivers_license: true,
    has_paystubs: false,
    has_bank_statements: false,
    has_credit_report: false,
    has_preapproval: false
  });

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (gradeFilter !== "all") query = query.eq("quality_grade", gradeFilter);
    if (statusFilter !== "all") query = query.eq("sold_status", statusFilter);

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to fetch leads");
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [gradeFilter, statusFilter]);

  const filteredLeads = leads.filter(l => 
    l.reference_code?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase()) ||
    l.province?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveLead = async () => {
    setLoading(true);
    const data = { ...formData };
    
    // Generate ref code if missing
    if (!data.reference_code) {
      data.reference_code = `MX-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    let error;
    if (editingLead) {
      const { error: err } = await supabase
        .from("leads")
        .update(data)
        .eq("id", editingLead.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from("leads")
        .insert(data);
      error = err;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingLead ? "Lead updated successfully" : "Lead created successfully");
      setIsFormOpen(false);
      setEditingLead(null);
      fetchLeads();
    }
    setLoading(false);
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead? This action is permanent.")) return;
    
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
       toast.error("Failed to delete lead");
    } else {
       toast.success("Lead removed from inventory");
       fetchLeads();
    }
  };

  const provinces = [
    "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", 
    "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland", "PEI"
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Lead Inventory</h1>
          <p className="text-amber-500/40 text-sm mt-1">Add, edit, manage auto-loan leads across Canada</p>
        </div>
        <Button 
          onClick={() => { setEditingLead(null); setFormData({ ...formData, reference_code: "" }); setIsFormOpen(true); }}
          className="bg-amber-500 hover:bg-amber-600 text-[#0F1729] font-bold gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Manual Lead
        </Button>
      </div>

      {/* Filter Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase font-bold tracking-widest">Available</span>
            <span className="text-xl font-bold text-emerald-500 font-mono">{leads.filter(l => l.sold_status === 'available').length}</span>
         </div>
         <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase font-bold tracking-widest">Sold</span>
            <span className="text-xl font-bold text-blue-500 font-mono">{leads.filter(l => l.sold_status === 'sold').length}</span>
         </div>
         <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase font-bold tracking-widest">A+ Grade</span>
            <span className="text-xl font-bold text-amber-500 font-mono">{leads.filter(l => l.quality_grade === 'A+').length}</span>
         </div>
         <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase font-bold tracking-widest">Total Inventory</span>
            <span className="text-xl font-bold text-white font-mono">{leads.length}</span>
         </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/40 group-focus-within:text-amber-500 transition-colors" />
          <Input 
            placeholder="Search by Ref Code or City..." 
            className="pl-10 bg-white/5 border-amber-500/10 focus-visible:ring-amber-500/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
           <Select value={gradeFilter} onValueChange={setGradeFilter}>
             <SelectTrigger className="w-[120px] bg-white/5 border-white/10 text-white/60">
               <SelectValue placeholder="Grade" />
             </SelectTrigger>
             <SelectContent className="bg-[#0F1729] border-white/10 text-white">
               <SelectItem value="all">All Grades</SelectItem>
               <SelectItem value="A+">A+</SelectItem>
               <SelectItem value="A">A</SelectItem>
               <SelectItem value="B">B</SelectItem>
               <SelectItem value="C">C</SelectItem>
             </SelectContent>
           </Select>
           <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white/60">
               <SelectValue placeholder="Status" />
             </SelectTrigger>
             <SelectContent className="bg-[#0F1729] border-white/10 text-white">
               <SelectItem value="all">Any Status</SelectItem>
               <SelectItem value="available">Available</SelectItem>
               <SelectItem value="sold">Sold</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card border-amber-500/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Code</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Location / Buyer</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold">Scoring</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-right">Price</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-center">Status</TableHead>
              <TableHead className="text-amber-500/40 uppercase text-[10px] font-bold text-right pr-6">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-white/20 italic">Loading inventory...</TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-white/20 italic">No leads found.</TableCell>
              </TableRow>
            ) : filteredLeads.map((lead) => (
              <TableRow key={lead.id} className="border-b border-white/5 hover:bg-amber-500/5 transition-colors group">
                <TableCell className="py-2.5">
                   <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-1 h-8 rounded-full",
                        lead.quality_grade === 'A+' ? "bg-amber-500" :
                        lead.quality_grade === 'A' ? "bg-blue-500" :
                        lead.quality_grade === 'B' ? "bg-cyan-500" :
                        "bg-white/20"
                      )} />
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-bold text-white uppercase tracking-tight">{lead.reference_code}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">{lead.initials}</span>
                      </div>
                   </div>
                </TableCell>
                <TableCell>
                   <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-xs text-white/70">
                        <MapPin className="h-3 w-3 text-amber-500/40" />
                        {lead.city}, {lead.province}
                      </div>
                      <span className="text-[10px] text-white/30 uppercase tracking-tighter mt-1">{lead.buyer_type} · ${Number(lead.income).toLocaleString()} income</span>
                   </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                         <div className="flex items-center gap-1.5 font-bold text-amber-500">
                           <BrainCircuit className="h-3 w-3" />
                           <span className="text-xs">{lead.ai_score}</span>
                         </div>
                         <p className="text-[10px] text-white/20 uppercase tracking-widest">IQ Score</p>
                      </div>
                      <Badge className={cn(
                        "uppercase text-[10px] font-black tracking-tighter px-2 h-5",
                        lead.quality_grade === 'A+' ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
                        lead.quality_grade === 'A' ? "bg-blue-500/20 text-blue-500 border-blue-500/30" :
                        "bg-white/10 text-white/40"
                      )}>
                        {lead.quality_grade} Grade
                      </Badge>
                   </div>
                </TableCell>
                <TableCell className="text-right">
                   <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-emerald-400 font-mono">${lead.price}</span>
                      <span className="text-[10px] text-white/20 uppercase tracking-tighter">Fixed Price</span>
                   </div>
                </TableCell>
                <TableCell className="text-center">
                   <div className="flex justify-center">
                     <Badge className={cn(
                       "uppercase text-[9px] font-bold",
                       lead.sold_status === 'sold' ? "bg-blue-500/20 text-blue-500 border-blue-500/20" : "bg-emerald-500/20 text-emerald-500 border-emerald-500/20"
                     )}>
                       {lead.sold_status}
                     </Badge>
                   </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                   <span className="text-xs text-white/20">{format(new Date(lead.created_at), "MMM dd")}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-white/30 hover:text-amber-500 hover:bg-amber-500/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#0F1729] border-white/10 text-white">
                      <DropdownMenuItem onClick={() => { setEditingLead(lead); setFormData({ ...lead }); setIsFormOpen(true); }} className="gap-2 cursor-pointer">
                        <Edit3 className="h-4 w-4" /> Edit Lead Data
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Eye className="h-4 w-4" /> View Full PII
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-blue-500/20 focus:text-blue-400">
                        <BadgeDollarSign className="h-4 w-4" /> Force Sold State
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem onClick={() => handleDeleteLead(lead.id)} className="gap-2 cursor-pointer text-rose-400 focus:bg-rose-500/20 focus:text-rose-400">
                        <Trash2 className="h-4 w-4" /> Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Lead Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#0F1729] border-amber-500/20 text-white max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-amber-500 flex items-center gap-2">
              <Plus className="h-5 w-5" /> 
              {editingLead ? "Edit Marketplace Lead" : "New Marketplace Lead Entry"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4">
             {/* General Info */}
             <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-white/40">Buyer Initials</Label>
                <Input value={formData.initials} onChange={(e) => setFormData({ ...formData, initials: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. J.S." />
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-white/40">Buyer Type</Label>
                <Select value={formData.buyer_type} onValueChange={(v) => setFormData({ ...formData, buyer_type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1729] border-white/10 text-white">
                    <SelectItem value="online">Online Application</SelectItem>
                    <SelectItem value="in_store">In-Store Visitor</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             
             {/* Location */}
             <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-white/40">City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Toronto" />
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-white/40">Province</Label>
                <Select value={formData.province} onValueChange={(v) => setFormData({ ...formData, province: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1729] border-white/10 text-white">
                    {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>

             {/* Credit & Income */}
             <div className="space-y-3 col-span-2 p-4 bg-white/5 rounded-lg border border-white/5 mt-2">
                <Label className="text-[10px] uppercase font-bold text-amber-500/60">Financial Profile</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] text-white/40">Monthly Income ($)</Label>
                    <Input type="number" value={formData.income} onChange={(e) => setFormData({ ...formData, income: e.target.value })} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] text-white/40">Vehicle Preference</Label>
                    <Input value={formData.vehicle_preference} onChange={(e) => setFormData({ ...formData, vehicle_preference: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. SUV, Truck..." />
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                   <div className="flex justify-between items-center">
                     <Label className="text-[10px] text-white/40 uppercase">Credit Range</Label>
                     <span className="text-[10px] font-mono text-amber-500 font-bold">{formData.credit_range_min} - {formData.credit_range_max}</span>
                   </div>
                   <div className="flex gap-4 items-center">
                      <Slider 
                        defaultValue={[formData.credit_range_min, formData.credit_range_max]} 
                        max={900} 
                        min={300} 
                        step={10} 
                        onValueChange={([min, max]) => setFormData({ ...formData, credit_range_min: min, credit_range_max: max })}
                        className="flex-1"
                      />
                   </div>
                </div>
             </div>

             {/* Pricing & AI Score */}
             <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-white/40">Marketplace Price ($)</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="bg-white/5 border-white/10" />
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-white/40">AI IQ Score (0-100)</Label>
                <Input type="number" value={formData.ai_score} onChange={(e) => setFormData({ ...formData, ai_score: e.target.value })} className="bg-white/5 border-white/10" />
             </div>

             <div className="space-y-2 col-span-2">
                <Label className="text-[10px] uppercase font-bold text-white/40">Quality Grade</Label>
                <div className="grid grid-cols-4 gap-2">
                   {['A+', 'A', 'B', 'C'].map(g => (
                     <button
                        key={g}
                        onClick={() => setFormData({ ...formData, quality_grade: g })}
                        className={cn(
                          "py-2 rounded border uppercase font-bold text-xs transition-all",
                          formData.quality_grade === g 
                            ? "bg-amber-500 text-[#0F1729] border-amber-500" 
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        )}
                     >
                       {g} Grade
                     </button>
                   ))}
                </div>
             </div>

             {/* Documents */}
             <div className="col-span-2 space-y-3 pt-4 border-t border-white/5">
                <Label className="text-[10px] uppercase font-bold text-white/60">Verified Documents</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {[
                     { id: 'has_drivers_license', label: "Drivers License" },
                     { id: 'has_paystubs', label: "Recent Paystubs" },
                     { id: 'has_bank_statements', label: "Bank Statements" },
                     { id: 'has_credit_report', label: "Credit Report" },
                     { id: 'has_preapproval', label: "Lender Pre-approval" },
                   ].map((doc) => (
                     <div key={doc.id} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                        <Checkbox 
                          id={doc.id} 
                          checked={formData[doc.id]} 
                          onCheckedChange={(checked) => setFormData({ ...formData, [doc.id]: checked })}
                          className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                        <Label htmlFor={doc.id} className="text-[11px] text-white/60 cursor-pointer">{doc.label}</Label>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <DialogFooter className="mt-6 border-t border-white/5 pt-6 gap-2">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="text-white/40 hover:text-white">Cancel</Button>
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-[#0F1729] font-bold px-8"
              onClick={handleSaveLead}
              disabled={loading}
            >
              {loading ? "Saving..." : (editingLead ? "Save Changes" : "Publish to Marketplace")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
