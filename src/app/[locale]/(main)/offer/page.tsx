import React from "react";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OfferRideForm } from "./offer-ride-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bike, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";

export default async function OfferRidePage({
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
    redirect(`/${locale}/login?next=/${locale}/offer`);
  }

  // Check email verification
  const isEmailVerified = Boolean(user.email_confirmed_at);

  // Check rider profile
  const { data: riderProfile } = await supabase
    .from("rider_profiles")
    .select("bike_model, helmet_available, verification")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Offer a Bike Ride</h1>
        <p className="text-sm text-slate-500">
          Share your daily Nashik motorcycle commute and split the fuel cost with a fellow commuter.
        </p>
      </div>

      {/* Unverified Email Barrier */}
      {!isEmailVerified && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50 p-6">
          <CardContent className="p-0 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-amber-900">Email Verification Required</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                For commuter safety on Nashik roads, you must verify your email address before offering rides.
                Check your inbox for the confirmation link or request a new one.
              </p>
              <Link href={`/${locale}/verify-email`}>
                <Button size="sm" className="h-8 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg">
                  Verify Email Address
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Rider Profile Barrier */}
      {isEmailVerified && !riderProfile && (
        <Card className="rounded-2xl border-blue-200 bg-blue-50/50 p-6">
          <CardContent className="p-0 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1853DB]/10 text-[#1853DB] flex items-center justify-center shrink-0">
              <Bike className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Rider Onboarding Required</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Before offering seats on your bike, please register your vehicle model, registration number,
                and upload your driving licence and RC.
              </p>
              <Link href={`/${locale}/onboarding/rider`}>
                <Button size="sm" className="h-8 text-xs bg-[#1853DB] hover:bg-blue-700 text-white rounded-lg gap-1.5">
                  Start Rider Onboarding
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Rider Verification Notice */}
      {isEmailVerified && riderProfile && riderProfile.verification === "pending" && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-800">Profile Pending Verification: </span>
            Your documents are currently being reviewed by our Nashik verification team. You can
            post rides now; they will show with an &quot;Unverified rider&quot; badge until approved.
          </div>
        </div>
      )}

      {/* Offer Form */}
      {isEmailVerified && riderProfile && (
        <OfferRideForm
          riderProfile={{
            bikeModel: riderProfile.bike_model,
            helmetAvailable: riderProfile.helmet_available,
            verification: riderProfile.verification,
          }}
          locale={locale}
        />
      )}
    </div>
  );
}
