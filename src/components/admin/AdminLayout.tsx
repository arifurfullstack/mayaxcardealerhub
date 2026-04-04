import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Shield, Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLayout() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0F1729] text-foreground">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Admin TopBar */}
        <header className="h-16 border-b border-amber-500/10 bg-[#0F1729]/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-2 text-amber-500/80">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Admin Control Center</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center hover:bg-amber-500/20 transition-colors">
              <Bell className="h-4 w-4 text-amber-500/70" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-amber-500/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-amber-200">{userEmail?.split('@')[0]}</p>
                <p className="text-[10px] text-amber-500/60 uppercase">Root Admin</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center border border-amber-500/30">
                <User className="h-4 w-4 text-[#0F1729]" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
          {/* Subtle background glow for admin feel */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] -z-10 pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/5 blur-[100px] -z-10 pointer-events-none rounded-full" />
          
          <Outlet />
        </main>
      </div>
    </div>
  );
}
