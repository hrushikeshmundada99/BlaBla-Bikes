import { setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Filter } from "lucide-react";

export default async function FindRidesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string; date?: string }>;
}) {
  const { locale } = await params;
  const { from, to } = await searchParams;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Available Rides</h1>
          <p className="text-sm text-slate-500">
            {from && to
              ? `Rides from ${from} to ${to}`
              : "Find verified commuters sharing seats across Nashik"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <EmptyState
          icon="search"
          title="No direct rides found"
          description={
            from || to
              ? `No current rides scheduled for ${from || "Nashik"} to ${to || "Nashik"}. Try selecting another hub or check back soon!`
              : "Enter your pickup and destination in Nashik to discover rides heading your way."
          }
        />
      </div>
    </div>
  );
}
