import { setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";

export default async function MyRidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Rides</h1>
        <p className="text-sm text-slate-500">
          Track upcoming, past, offered, and requested rides.
        </p>
      </div>

      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500">
        <button className="pb-3 border-b-2 border-[#1853DB] text-[#1853DB]">
          Upcoming
        </button>
        <button className="pb-3 hover:text-slate-800">Past</button>
        <button className="pb-3 hover:text-slate-800">Offered</button>
        <button className="pb-3 hover:text-slate-800">Requested</button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <EmptyState
          icon="bike"
          title="No rides found"
          description="You don't have any rides under this tab yet."
        />
      </div>
    </div>
  );
}

