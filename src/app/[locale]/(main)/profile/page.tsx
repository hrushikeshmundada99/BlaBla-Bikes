import { setRequestLocale } from "next-intl/server";
import { User, ShieldCheck } from "lucide-react";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your account, verification status, and emergency contacts.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1853DB] flex items-center justify-center font-bold text-xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Guest User</h3>
            <p className="text-xs text-slate-500">Nashik Commuter</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Passenger Account (Unregistered)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
