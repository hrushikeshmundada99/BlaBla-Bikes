import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

export function RideCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  );
}
