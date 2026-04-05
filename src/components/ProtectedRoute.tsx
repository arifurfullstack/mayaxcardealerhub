import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [status, setStatus] = useState<"loading" | "approved" | "pending" | "rejected" | "suspended" | "admin" | "unauthenticated">("loading");
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus("unauthenticated"); return; }

      const userId = session.user.id;
      const userEmail = session.user.email ?? "";

      // Dev fallback: grant admin if email is a known admin email
      const ADMIN_EMAILS = ["admin@mayax.test", "arifur.fullstack@gmail.com"];
      if (ADMIN_EMAILS.includes(userEmail)) { setStatus("admin"); return; }

      // Check admin via DB
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      if (roles?.some((r: any) => r.role === "admin")) { setStatus("admin"); return; }

      // Check dealer
      const { data: dealer } = await supabase.from("dealers").select("approval_status").eq("user_id", userId).single();
      if (!dealer) { setStatus("pending"); return; }
      setStatus(dealer.approval_status as any);
    };
    check();
  }, [location.pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F1729" }}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  if (requireAdmin && status !== "admin") return <Navigate to="/login" replace />;
  
  // If user is admin trying to access a standard protected route (dealer dashboard), redirect to admin panel
  if (status === "admin" && !requireAdmin) return <Navigate to="/admin/overview" replace />;

  if (status === "pending") return <Navigate to="/pending" replace />;
  if (status === "rejected") return <Navigate to="/rejected" replace />;
  if (status === "suspended") return <Navigate to="/suspended" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
