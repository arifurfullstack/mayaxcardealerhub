import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Dev fallback: these emails always have admin access
const ADMIN_EMAILS = ["admin@mayax.test", "arifur.fullstack@gmail.com"];

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus("denied"); return; }

      // Dev fallback: grant admin if email is in the known admin list
      if (ADMIN_EMAILS.includes(session.user.email ?? "")) {
        setStatus("admin");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (roles?.some((r: any) => r.role === "admin")) {
        setStatus("admin");
      } else {
        setStatus("denied");
      }
    };
    check();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F1729" }}>
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "denied") return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default AdminRoute;
