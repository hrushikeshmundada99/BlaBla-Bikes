import * as React from "react";
import { cn } from "@/lib/utils";
import { Bike, SearchX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: "bike" | "search" | "alert";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = "search",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const IconComponent =
    icon === "bike" ? Bike : icon === "alert" ? AlertCircle : SearchX;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-4 max-w-md mx-auto my-8",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
        <IconComponent className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

