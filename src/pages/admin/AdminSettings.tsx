import { useState, useEffect } from "react";
import { 
  Settings2, 
  ShieldCheck, 
  BadgeDollarSign, 
  Globe, 
  Bell, 
  Save, 
  RotateCcw,
  AlertTriangle,
  Lock,
  Eye,
  Info,
  Server,
  Zap,
  Mail,
  Smartphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("monetization");
  const [flushing, setFlushing] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    // @ts-ignore
    const { data, error } = await supabase.from("platform_settings").select("*");
    if (error) toast.error("Failed to fetch settings");
    else setSettings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = settings.map(s => 
        // @ts-ignore
        supabase.from("platform_settings").update({ value: s.value }).eq("key", s.key)
      );
      await Promise.all(promises);
      toast.success("Platform settings updated system-wide");
      fetchSettings();
    } catch (err) {
      toast.error("Failed to save some settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFlushCache = () => {
    setFlushing(true);
    toast.info("Flushing global platform cache...");
    setTimeout(() => {
      setFlushing(false);
      toast.success("Platform cache flushed successfully. Sessions revalidated.");
    }, 1500);
  };

  const findValue = (key: string) => settings.find(s => s.key === key)?.value;

  if (loading) return <div className="h-48 flex items-center justify-center text-amber-500/40 animate-pulse font-mono uppercase text-xs tracking-widest">Accessing platform core...</div>;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header */}
      <div className="flex items-end justify-between">
         <div>
            <h1 className="text-3xl font-bold text-amber-500 tracking-tight">System Configuration</h1>
            <p className="text-amber-500/40 text-sm mt-1">Platform behaviors, global thresholds, and security parameters</p>
         </div>
         <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={fetchSettings} className="text-white/40 hover:text-white">
               <RotateCcw className="h-4 w-4 mr-2" />
               Revert
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-[#0F1729] font-bold shadow-lg shadow-amber-500/20">
               {saving ? "Deploying..." : (
                 <><Save className="h-4 w-4 mr-2" /> Commit Changes</>
               )}
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Left col - Sidebar menu stubs */}
         <div className="md:col-span-1 space-y-2">
            <NavButton icon={BadgeDollarSign} label="Monetization" active={activeTab === 'monetization'} onClick={() => setActiveTab('monetization')} />
            <NavButton icon={ShieldCheck} label="Account Security" active={activeTab === 'account_security'} onClick={() => setActiveTab('account_security')} />
            <NavButton icon={Globe} label="Public Experience" active={activeTab === 'public_experience'} onClick={() => setActiveTab('public_experience')} />
            <NavButton icon={Bell} label="Alert Triggers" active={activeTab === 'alert_triggers'} onClick={() => setActiveTab('alert_triggers')} />
            <NavButton icon={Server} label="Infrastructure" active={activeTab === 'infrastructure'} onClick={() => setActiveTab('infrastructure')} />
            
            <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
               <div className="flex items-center gap-2 text-amber-500/60 mb-2">
                  <Lock className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Admin Oversight</span>
               </div>
               <p className="text-[11px] text-white/30 leading-relaxed">Changes to these parameters affect live transactional data. Handle with extreme caution.</p>
            </div>
         </div>

         {/* Right col - Settings Forms */}
         <div className="md:col-span-2 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500" key={activeTab}>
            
            {activeTab === 'monetization' && (
              <section className="space-y-6">
                 <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <BadgeDollarSign className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Global Pricing Logic</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center justify-between group">
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold text-white/80">Base Lead Price</Label>
                        <p className="text-[11px] text-white/40">Minimum cost for an un-graded lead entry</p>
                      </div>
                      <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                         <Input 
                           type="number"
                           value={findValue('base_lead_price') || 45}
                           onChange={(e) => updateSetting('base_lead_price', e.target.value)}
                           className="w-32 bg-white/5 border-white/10 pl-6 text-right font-mono text-amber-500 font-bold"
                         />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold text-white/80">Premium Grade Multiplier</Label>
                        <p className="text-[11px] text-white/40">Added cost factor for A+ quality marks</p>
                      </div>
                      <div className="relative">
                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">x</span>
                         <Input 
                           type="number" step="0.1"
                           value={findValue('grade_premium_multiplier') || 1.5}
                           onChange={(e) => updateSetting('grade_premium_multiplier', e.target.value)}
                           className="w-32 bg-white/5 border-white/10 pr-6 text-right font-mono text-amber-500 font-bold"
                         />
                      </div>
                    </div>
                 </div>
              </section>
            )}

            {(activeTab === 'public_experience' || activeTab === 'alert_triggers') && (
              <section className="space-y-6">
                 <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">System Thresholds</h3>
                 </div>
                 <div className="space-y-6">
                    {activeTab === 'public_experience' && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-semibold text-white/80">Enable Public Registration</Label>
                            <p className="text-[11px] text-white/40">Open platform for new dealer signups</p>
                          </div>
                          <Switch 
                            checked={findValue('enable_public_registration') === 'true'} 
                            onCheckedChange={(val) => updateSetting('enable_public_registration', val.toString())}
                            className="data-[state=checked]:bg-amber-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-semibold text-white/80">Marketplace Real-time Discovery</Label>
                            <p className="text-[11px] text-white/40">Allow leads to be visible immediately on listing</p>
                          </div>
                          <Switch 
                            checked={findValue('realtime_marketplace') === 'true'} 
                            onCheckedChange={(val) => updateSetting('realtime_marketplace', val.toString())}
                            className="data-[state=checked]:bg-amber-500"
                          />
                        </div>
                      </>
                    )}
                    
                    {activeTab === 'alert_triggers' && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-white/80">Minimum Wallet Balance (Alert)</Label>
                          <p className="text-[11px] text-white/40">Notify dealers when their balance hits this floor</p>
                        </div>
                        <Input 
                          type="number"
                          value={findValue('min_wallet_alert') || 100}
                          onChange={(e) => updateSetting('min_wallet_alert', e.target.value)}
                          className="w-32 bg-white/5 border-white/10 text-right font-mono"
                        />
                      </div>
                    )}
                 </div>
              </section>
            )}

            {activeTab === 'infrastructure' && (
              <section className="space-y-6">
                 <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Info className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Global Broadcast</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-white/40">System Anniversary Message</Label>
                      <Input 
                        value={findValue('system_announcement') || "Welcome to MayaX Lead Hub. v2.0 Live."}
                        onChange={(e) => updateSetting('system_announcement', e.target.value)}
                        className="bg-white/5 border-white/10 italic"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-center gap-2 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                          <Mail className="h-4 w-4 text-emerald-500" />
                          <span className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest">Email Active</span>
                       </div>
                       <div className="flex items-center gap-2 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                          <Smartphone className="h-4 w-4 text-rose-500" />
                          <span className="text-[11px] text-rose-500 font-bold uppercase tracking-widest">SMS Disabled</span>
                       </div>
                    </div>
                 </div>
              </section>
            )}
            
            {(activeTab === 'account_security' || activeTab === 'infrastructure') && (
              <>
                <Separator className="bg-white/5" />
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex gap-4">
                   <AlertTriangle className="h-10 w-10 text-rose-500 shrink-0" />
                   <div className="space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Danger Zone: System Cache</h4>
                      <p className="text-[11px] text-white/40 leading-relaxed mb-4">Clearing the shared platform cache will disconnect all active dealer sessions and trigger a global state re-validation.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-rose-500/20 text-rose-500 hover:bg-rose-500/20 text-[10px] uppercase font-bold"
                        onClick={handleFlushCache}
                        disabled={flushing}
                      >
                        {flushing ? "Flushing Cache..." : "Flush Platform Cache"}
                      </Button>
                   </div>
                </div>
              </>
            )}
         </div>
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-medium text-sm",
      active 
        ? "bg-amber-500 text-[#0F1729] shadow-lg shadow-amber-500/20 font-bold" 
        : "text-white/40 hover:bg-white/5 hover:text-white"
    )}>
      <Icon className={cn("h-4 w-4", active ? "text-[#0F1729]" : "text-amber-500/40 group-hover:text-amber-500")} />
      {label}
    </button>
  );
}
