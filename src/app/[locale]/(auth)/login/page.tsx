import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500">
          Sign in to your BlaBlaBikes account to manage rides
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft space-y-4">
        <p className="text-xs text-slate-600 text-center">
          Authentication forms (Email/Password & Google OAuth) with Supabase session cookies will be wired in Phase 2.
        </p>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#1853DB] font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
