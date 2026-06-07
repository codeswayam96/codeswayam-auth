import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLoaderProps {
  fullScreen?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function BrandLoader({
  fullScreen = false,
  className,
  size = "md",
  text,
}: BrandLoaderProps) {
  const containerClasses = fullScreen
    ? "flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden"
    : "flex flex-col items-center justify-center p-8 w-full min-h-[300px] bg-background/50 backdrop-blur-sm rounded-2xl border border-border/20";

  const dimensions = {
    sm: { box: "w-10 h-10 rounded-xl", icon: 20 },
    md: { box: "w-14 h-14 rounded-2xl", icon: 28 },
    lg: { box: "w-20 h-20 rounded-[24px]", icon: 40 },
  };

  const currentSize = dimensions[size];

  return (
    <div className={cn(containerClasses, className)}>
      {fullScreen && (
        <>
          {/* Subtle background glowing spots */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.08]"
            style={{
              background: "radial-gradient(circle, hsl(262 83% 57%) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.08]"
            style={{
              background: "radial-gradient(circle, hsl(262 83% 57%) 0%, transparent 70%)",
            }}
          />
        </>
      )}

      {/* Main glowing container */}
      <div className="relative flex items-center justify-center">
        {/* Ambient glow behind logo */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse duration-1000",
          size === "lg" ? "scale-150" : "scale-125"
        )} />
        
        {/* Brand logo wrapper */}
        <div className={cn(
          "bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 relative z-10 transition-all duration-300",
          currentSize.box
        )}>
          <Zap
            size={currentSize.icon}
            className="text-primary-foreground fill-current animate-bounce [animation-duration:1.5s]"
          />
        </div>
        
        {/* Pulsing outer ring */}
        <div className={cn(
          "absolute border-2 border-primary/20 rounded-full animate-ping pointer-events-none",
          size === "sm" ? "w-12 h-12" : size === "md" ? "w-20 h-20" : "w-28 h-28"
        )} />
      </div>

      {text && (
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
