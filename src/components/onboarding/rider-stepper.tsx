"use client";

import * as React from "react";
import { submitRiderOnboardingAction } from "@/app/actions/rider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, UploadCloud, RotateCw } from "lucide-react";

interface RiderProfileData {
  verification: "none" | "pending" | "approved" | "rejected";
  verificationNote?: string | null;
  bikeModel?: string;
  registrationNumber?: string;
  licenceNumber?: string;
  helmetAvailable?: boolean;
}

export function RiderStepper({ existingProfile }: { existingProfile?: RiderProfileData | null }) {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Form State
  const [bikeModel, setBikeModel] = React.useState(existingProfile?.bikeModel || "");
  const [registrationNumber, setRegistrationNumber] = React.useState(existingProfile?.registrationNumber || "");
  const [helmetAvailable, setHelmetAvailable] = React.useState(existingProfile?.helmetAvailable ?? true);
  const [licenceNumber, setLicenceNumber] = React.useState(existingProfile?.licenceNumber || "");

  const [licenceFile, setLicenceFile] = React.useState<File | null>(null);
  const [rcFile, setRcFile] = React.useState<File | null>(null);
  const [bikePhoto, setBikePhoto] = React.useState<File | null>(null);

  // If already pending or approved, show status banner instead of re-submitting
  if (existingProfile?.verification === "pending") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Application Under Review</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Your rider verification documents (Licence & RC) have been submitted. An administrator will review your documents within 24 hours.
          </p>
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
          Status: Pending Approval
        </div>
      </div>
    );
  }

  if (existingProfile?.verification === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Verified Rider Active</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Your motorcycle and driving licence are verified. You can publish rides across Nashik with a verified rider trust badge!
          </p>
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-xs font-bold uppercase tracking-wider">
          Status: Verified
        </div>
      </div>
    );
  }

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bikeModel.trim()) {
      setError("Please specify your motorcycle model.");
      return;
    }
    const cleanReg = registrationNumber.toUpperCase().replace(/[\s-]/g, "");
    if (!/^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/.test(cleanReg)) {
      setError("Please enter a valid vehicle registration number (e.g. MH15AB1234).");
      return;
    }
    setRegistrationNumber(cleanReg);
    setError(null);
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenceNumber.trim()) {
      setError("Please enter your driving licence number.");
      return;
    }
    if (!licenceFile) {
      setError("Please attach a photo or PDF of your driving licence.");
      return;
    }
    if (!rcFile) {
      setError("Please attach a photo or PDF of your vehicle RC certificate.");
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("bikeModel", bikeModel);
    formData.append("registrationNumber", registrationNumber);
    formData.append("licenceNumber", licenceNumber);
    formData.append("helmetAvailable", String(helmetAvailable));

    if (licenceFile) formData.append("licenceDoc", licenceFile);
    if (rcFile) formData.append("rcDoc", rcFile);
    if (bikePhoto) formData.append("bikePhoto", bikePhoto);

    const res = await submitRiderOnboardingAction(null, formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to submit application.");
    } else {
      setSuccessMessage("Onboarding submitted successfully!");
    }
  };

  if (successMessage) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Application Submitted</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Thank you! Your documents are now under review. You can already offer rides while pending review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rejection Note Alert if previously rejected */}
      {existingProfile?.verification === "rejected" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Previous application was rejected
          </p>
          <p>
            {existingProfile.verificationNote || "Please ensure your document photos are clear and legible before resubmitting."}
          </p>
        </div>
      )}

      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        {[
          { num: 1, title: "Bike Details" },
          { num: 2, title: "Licence & RC" },
          { num: 3, title: "Review & Submit" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                step === s.num
                  ? "bg-[#1853DB] text-white"
                  : step > s.num
                  ? "bg-emerald-100 text-emerald-700 font-bold"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${
                step === s.num ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

      {/* STEP 1: Bike Details */}
      {step === 1 && (
        <form onSubmit={handleStep1Next} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Motorcycle Make & Model
            </label>
            <Input
              value={bikeModel}
              onChange={(e) => setBikeModel(e.target.value)}
              placeholder="e.g. Honda Shine 125, Bajaj Pulsar 150"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Registration Number (MH RTO Format)
            </label>
            <Input
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
              placeholder="e.g. MH15AB1234"
              required
            />
            <p className="text-[11px] text-slate-400">Nashik RTO series starts with MH-15.</p>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <input
              type="checkbox"
              id="helmet-check"
              checked={helmetAvailable}
              onChange={(e) => setHelmetAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-[#1853DB] focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="helmet-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
              I have a spare ISI/BIS approved helmet available for the pillion passenger
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="bg-[#1853DB] text-white gap-2 font-semibold text-xs px-6">
              <span>Next: Documents</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: Licence & Documents */}
      {step === 2 && (
        <form onSubmit={handleStep2Next} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Driving Licence Number
            </label>
            <Input
              value={licenceNumber}
              onChange={(e) => setLicenceNumber(e.target.value.toUpperCase())}
              placeholder="e.g. MH1520180012345"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Driving Licence (Photo or PDF) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setLicenceFile(e.target.files?.[0] || null)}
                required
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1853DB] hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            {licenceFile && <p className="text-[11px] text-emerald-600 font-medium">Attached: {licenceFile.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Registration Certificate (RC Document) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setRcFile(e.target.files?.[0] || null)}
                required
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1853DB] hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            {rcFile && <p className="text-[11px] text-emerald-600 font-medium">Attached: {rcFile.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Motorcycle Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setBikePhoto(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="gap-2 font-semibold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button type="submit" className="bg-[#1853DB] text-white gap-2 font-semibold text-xs px-6">
              <span>Next: Review</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
              Review Your Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Motorcycle</span>
                <span className="font-semibold text-slate-900">{bikeModel}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration</span>
                <span className="font-semibold text-slate-900">{registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Licence Number</span>
                <span className="font-semibold text-slate-900">{licenceNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pillion Helmet</span>
                <span className="font-semibold text-slate-900">{helmetAvailable ? "Yes, provided" : "No"}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setStep(2)}
              className="gap-2 font-semibold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="bg-[#1853DB] text-white gap-2 font-semibold text-xs px-6 shadow-sm"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Submit for Verification</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
