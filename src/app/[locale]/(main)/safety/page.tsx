import { setRequestLocale } from "next-intl/server";
import { Phone, ShieldAlert } from "lucide-react";

export default async function SafetyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Safety & Emergency Guidelines</h1>
        <p className="text-sm text-slate-500">
          Essential safety rules and emergency hotlines for commuting in Nashik, Maharashtra.
        </p>
      </div>

      {/* Emergency Hotlines Box */}
      <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-red-700 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>India & Maharashtra Emergency Hotlines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3.5 border border-red-100 shadow-sm flex items-center gap-3">
            <Phone className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Police Control</p>
              <p className="text-base font-bold text-slate-900">112</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-red-100 shadow-sm flex items-center gap-3">
            <Phone className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Women Helpline</p>
              <p className="text-base font-bold text-slate-900">1091</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-red-100 shadow-sm flex items-center gap-3">
            <Phone className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Medical Ambulance</p>
              <p className="text-base font-bold text-slate-900">108</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900">Nashik Traffic Police & Carpooling Rules</h3>
        <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc pl-5 leading-relaxed">
          <li>Both the rider and pillion passenger must wear ISI/BIS approved helmets at all times.</li>
          <li>Rides must be strictly cost-sharing (fuel pooling), not commercial operations.</li>
          <li>Keep your emergency contacts updated in your profile before departure.</li>
        </ul>
      </div>
    </div>
  );
}
