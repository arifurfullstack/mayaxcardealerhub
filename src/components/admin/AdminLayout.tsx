import { Outlet, useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Shield, Bell, User, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminLayout() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center hover:bg-amber-500/20 transition-colors">
                  <Bell className="h-4 w-4 text-amber-500/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-[#0F1729] border-white/10 text-white mt-2">
                <DropdownMenuLabel className="text-xs font-bold text-amber-500/60 uppercase">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="py-8 text-center px-4">
                  <p className="text-xs text-white/40 mb-1">No new notifications</p>
                  <p className="text-[10px] text-white/20">You're all caught up on system alerts.</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-4 border-l border-amber-500/10 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-amber-200 group-hover:text-amber-400 transition-colors">{userEmail?.split('@')[0]}</p>
                    <p className="text-[10px] text-amber-500/60 uppercase group-hover:text-amber-500 transition-colors">Root Admin</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center border border-amber-500/30">
                    <User className="h-4 w-4 text-[#0F1729]" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0F1729] border-white/10 text-white mt-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-amber-500">Root Admin</p>
                    <p className="text-xs leading-none text-white/40">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="cursor-pointer gap-2 focus:bg-amber-500/20 focus:text-amber-400">
                  <Settings className="h-4 w-4" /> System Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 focus:bg-rose-500/20 focus:text-rose-400">
                  <LogOut className="h-4 w-4" /> End Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
