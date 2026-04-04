import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Rejected = () => (
  <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0F1729" }}>
    <div className="glass-card p-10 max-w-md text-center" style={{ boxShadow: "0 0 15px rgba(239,68,68,0.3)" }}>
      <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">Application Not Approved</h2>
      <p className="text-muted-foreground mb-6">
        Unfortunately your application was not approved. Please contact support for more information.
      </p>
      <Button variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => window.open("mailto:support@mayaxleadhub.com")}>
        Contact Support
      </Button>
    </div>
  </div>
);

export default Rejected;
