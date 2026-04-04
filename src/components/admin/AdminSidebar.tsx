import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Users,
  Tag,
  ShoppingCart,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { icon: BarChart3, label: "Overview", path: "/admin/overview" },
  { icon: Building2, label: "Dealers", path: "/admin/dealers" },
  { icon: Users, label: "Providers", path: "/admin/providers" },
  { icon: Tag, label: "Leads", path: "/admin/leads" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: CreditCard, label: "Transactions", path: "/admin/transactions" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-amber-500/20 transition-all duration-300 relative",
        collapsed ? "w-16" : "w-56"
      )}
      style={{ background: "rgba(20, 15, 5, 0.95)", backdropFilter: "blur(12px)" }}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-amber-500/20", collapsed && "justify-center px-2")}>
        <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Shield className="h-4 w-4 text-amber-400" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-xs font-bold text-amber-400 tracking-widest uppercase">Admin</p>
            <p className="text-[10px] text-amber-500/60">MayaX Control</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-14 z-10 h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center hover:bg-amber-500/30 transition-colors"
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3 text-amber-400" />
          : <ChevronLeft className="h-3 w-3 text-amber-400" />
        }
      </button>

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                collapsed && "justify-center px-2",
                active
                  ? "bg-amber-500/20 text-amber-300 font-medium"
                  : "text-amber-500/60 hover:text-amber-300 hover:bg-amber-500/10"
              )}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-amber-400" : "")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-amber-500/20">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
