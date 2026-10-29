import { setRequestLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Fuel, Bike, ShieldCheck, Calendar } from "lucide-react";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Your Nashik daily commuting and fuel-sharing activity overview.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-100 bg-white p-5 shadow-soft">
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1853DB] flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Rides Shared</p>
              <h3 className="text-2xl font-bold text-slate-900">0</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 bg-white p-5 shadow-soft">
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Fuel Contribution</p>
              <h3 className="text-2xl font-bold text-slate-900">₹0</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 bg-white p-5 shadow-soft">
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Verification</p>
              <h3 className="text-lg font-bold text-slate-900">Passenger</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Rides Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1853DB]" />
            <h2 className="text-lg font-bold text-slate-900">Upcoming Rides</h2>
          </div>
        </div>

        <EmptyState
          icon="bike"
          title="No upcoming rides"
          description="You don't have any rides scheduled. Search available rides across Nashik or offer an empty seat on your bike!"
        />
      </div>
    </div>
  );
}
