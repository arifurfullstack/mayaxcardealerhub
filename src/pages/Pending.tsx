import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pending = () => (
  <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0F1729" }}>
    <div className="glass-card p-10 max-w-md text-center glow-cyan">
      <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
        <Clock className="w-8 h-8 text-accent" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">Account Under Review</h2>
      <p className="text-muted-foreground mb-6">
        Your dealer application is being reviewed by our team. You'll receive an email once approved.
      </p>
      <Link to="/subscription">
        <Button variant="outline" className="border-border text-foreground hover:bg-muted">
          Preview Subscription Plans
        </Button>
      </Link>
    </div>
  </div>
);

export default Pending;
