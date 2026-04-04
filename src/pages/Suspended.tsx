import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const Suspended = () => (
  <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0F1729" }}>
    <div className="glass-card p-10 max-w-md text-center" style={{ boxShadow: "0 0 15px rgba(245,158,11,0.3)" }}>
      <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-6">
        <ShieldOff className="w-8 h-8 text-warning" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">Account Suspended</h2>
      <p className="text-muted-foreground mb-6">
        Your account has been suspended. Please contact support for assistance.
      </p>
      <Button variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => window.open("mailto:support@mayaxleadhub.com")}>
        Contact Support
      </Button>
    </div>
  </div>
);

export default Suspended;
