import { setRequestLocale } from "next-intl/server";
import { Fuel } from "lucide-react";

export default async function OfferRidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Offer a Ride</h1>
        <p className="text-sm text-slate-500">
          Share your daily Nashik commute and split fuel costs within legal carpooling limits.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 flex items-center gap-3">
        <Fuel className="w-5 h-5 text-[#1853DB] shrink-0" />
        <p className="text-xs text-slate-700">
          <strong>Non-commercial Cost Sharing:</strong> Max allowable fuel contribution is strictly capped at ₹4.00 per km based on route distance.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <p className="text-sm text-slate-600">
          Ride offering form and route cost calculator will be fully initialized with database persistence in Phase 3.
        </p>
      </div>
    </div>
  );
}
