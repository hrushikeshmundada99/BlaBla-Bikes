import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { ProfileForm } from "./profile-form";
import { UnverifiedEmailBanner } from "@/components/auth/unverified-email-banner";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  // Fetch full profile and emergency contacts
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: contacts } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const isEmailVerified = Boolean(user!.email_confirmed_at);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!isEmailVerified && <UnverifiedEmailBanner />}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal commuter details, verification, and emergency safety contacts.
        </p>
      </div>

      <ProfileForm
        user={user!}
        profile={profile || {
          id: user!.id,
          full_name: user!.user_metadata?.full_name || "Commuter",
          avatar_url: user!.user_metadata?.avatar_url || null,
          bio: "",
          phone: "",
          preferred_language: locale,
        }}
        contacts={contacts || []}
      />
    </div>
  );
}
