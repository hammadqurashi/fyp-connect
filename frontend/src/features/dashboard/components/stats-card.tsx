import { ReactNode } from "react";
import { cn } from "@/shared/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  gradient?: "primary" | "success" | "warning" | "info" | "danger";
  className?: string;
}

const gradientClasses = {
  primary: {
    bg: "from-primary/10 to-primary/5 border-primary/20",
    text: "text-primary",
    textMuted: "text-primary/80",
  },
  success: {
    bg: "from-green-500/10 to-green-500/5 border-green-500/20",
    text: "text-green-600",
    textMuted: "text-green-600/80",
  },
  warning: {
    bg: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
    text: "text-yellow-600",
    textMuted: "text-yellow-600/80",
  },
  info: {
    bg: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
    text: "text-blue-600",
    textMuted: "text-blue-600/80",
  },
  danger: {
    bg: "from-destructive/10 to-destructive/5 border-destructive/20",
    text: "text-destructive",
    textMuted: "text-destructive/80",
  },
};

export function StatsCard({
  title,
  value,
  icon,
  gradient = "primary",
  className,
}: StatsCardProps) {
  const colors = gradientClasses[gradient];

  return (
    <div
      className={cn(
        "bg-gradient-to-br rounded-lg p-4 border",
        colors.bg,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={cn("text-sm", colors.textMuted)}>
            {title}
          </p>
          <p className={cn("text-2xl font-bold", colors.text)}>
            {value}
          </p>
        </div>
        {icon && (
          <div className={cn("opacity-60", colors.text)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

