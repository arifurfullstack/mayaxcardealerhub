import { Check, Crown, Zap, Shield, Star, Clock, BadgeCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import subscriptionBg from "@/assets/subscription-bg.jpg";

const tiers = [
  {
    name: "BASIC",
    price: 249,
    delayIcon: Clock,
    delayText: "Access leads\nafter 24 hours",
    glowColor: "0, 200, 220",
    borderClass: "border-cyan",
    nameColor: "text-cyan",
    checkColor: "text-cyan",
    ctaClass: "border-cyan/60 text-cyan hover:bg-cyan/10",
    features: ["Normal priority", "Standard support"],
    leadCount: "100",
    cta: "CHOOSE BASIC",
  },
  {
    name: "PRO",
    price: 499,
    delayIcon: Clock,
    delayText: "Access leads\nafter 12 hours",
    glowColor: "59, 130, 246",
    borderClass: "border-primary",
    nameColor: "text-primary",
    checkColor: "text-primary",
    ctaClass: "border-primary/60 text-primary hover:bg-primary/10",
    features: ["Faster access", "Priority support"],
    leadCount: "250",
    cta: "CHOOSE PRO",
  },
  {
    name: "ELITE",
    price: 999,
    delayIcon: Clock,
    delayText: "Access leads\nafter 6 hours",
    glowColor: "139, 92, 246",
    borderClass: "border-secondary",
    nameColor: "text-secondary",
    checkColor: "text-secondary",
    ctaClass: "border-secondary/60 text-secondary hover:bg-secondary/10",
    features: ["Early access", "Priority support"],
    leadCount: "500",
    cta: "CHOOSE ELITE",
  },
  {
    name: "VIP",
    price: 1799,
    delayIcon: Zap,
    delayText: "Instant access",
    glowColor: "200, 168, 78",
    borderClass: "border-gold",
    nameColor: "text-gold",
    checkColor: "text-gold",
    ctaClass: "border-gold/60 text-gold hover:bg-gold/10",
    popular: true,
    features: ["Instant access to leads", "Priority placement"],
    leadCount: "1000",
    cta: "CHOOSE VIP",
  },
];

const Subscription = () => {
  return (
    <div className="relative p-6 md:p-10 min-h-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={subscriptionBg}
          alt=""
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Choose Your Subscription
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto mb-6">
            Select a plan that suits your needs and unlock access to verified auto leads
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <BadgeCheck className="h-5 w-5 text-success" />
              <span>Verified Leads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Zap className="h-5 w-5 text-warning" />
              <span>Fast Access</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Users className="h-5 w-5 text-success" />
              <span>Trusted Buyers</span>
            </div>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {tiers.map((tier) => {
            const DelayIcon = tier.delayIcon;
            return (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border-2 p-6 pt-8 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg",
                  tier.borderClass
                )}
                style={{
                  background: "rgba(10, 15, 30, 0.75)",
                  backdropFilter: "blur(12px)",
                  boxShadow: `0 0 30px rgba(${tier.glowColor}, 0.4), 0 0 60px rgba(${tier.glowColor}, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)`,
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="border border-gold/70 bg-gold/10 text-gold text-[10px] font-bold px-4 py-1 rounded-sm uppercase tracking-[0.2em] whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier Name */}
                <h2 className={cn("text-2xl font-extrabold tracking-wider mb-5 text-center", tier.nameColor)}>
                  {tier.name}
                </h2>

                {/* Access Delay */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div className={cn("p-1.5 rounded-full bg-muted/50")}>
                    <DelayIcon className={cn("h-5 w-5", tier.nameColor)} />
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-pre-line leading-tight">
                    {tier.delayText}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">${tier.price}</span>
                  <span className="text-muted-foreground text-base ml-1">/ mo</span>
                </div>

                {/* Features */}
                <ul className="w-full space-y-3 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground/90">
                      <Check className={cn("w-4 h-4 shrink-0", tier.checkColor)} />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                    <Check className={cn("w-4 h-4 shrink-0", tier.checkColor)} />
                    <span>{tier.leadCount} <span className="font-normal text-foreground/80">Leads / mo</span></span>
                  </li>
                </ul>

                {/* CTA */}
                <button
                  className={cn(
                    "w-full py-3 rounded-lg font-bold text-sm tracking-wider transition-colors border-2 bg-transparent",
                    tier.ctaClass
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-10">
          Renew, upgrade, or downgrade anytime. Month-to-month, cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
