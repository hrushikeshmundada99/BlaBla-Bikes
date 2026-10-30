import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { RiderStepper } from "@/components/onboarding/rider-stepper";
import { UnverifiedEmailBanner } from "@/components/auth/unverified-email-banner";

export default async function RiderOnboardingPage({
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
    redirect({ href: "/login?next=/onboarding/rider", locale });
  }

  // Fetch existing rider profile if any
  const { data: riderProfile } = await supabase
    .from("rider_profiles")
    .select("bike_model, registration_number, licence_number, helmet_available, verification, verification_note")
    .eq("user_id", user!.id)
    .single();

  const isEmailVerified = Boolean(user!.email_confirmed_at);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!isEmailVerified && <UnverifiedEmailBanner />}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rider Onboarding</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Verify your motorcycle and driving licence to offer pillion seats and split fuel across Nashik.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft">
        <RiderStepper
          existingProfile={
            riderProfile
              ? {
                  bikeModel: riderProfile.bike_model,
                  registrationNumber: riderProfile.registration_number,
                  licenceNumber: riderProfile.licence_number,
                  helmetAvailable: riderProfile.helmet_available,
                  verification: riderProfile.verification as any,
                  verificationNote: riderProfile.verification_note,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
