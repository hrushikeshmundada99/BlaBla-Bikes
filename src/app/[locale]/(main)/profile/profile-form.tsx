"use client";

import * as React from "react";
import { updateProfileAction, deleteAccountAction } from "@/app/actions/profile";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { EmergencyContactsManager, type EmergencyContact } from "@/components/profile/emergency-contacts-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/routing";
import { CheckCircle2, AlertCircle, Save, Trash2, ShieldCheck } from "lucide-react";

interface ProfileFormProps {
  user: { id: string; email?: string };
  profile: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    bio?: string | null;
    phone?: string | null;
    preferred_language?: string;
  };
  contacts: EmergencyContact[];
}

export function ProfileForm({ user, profile, contacts }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfileAction(null, formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to update profile.");
    } else {
      setMessage("Profile saved successfully!");
      router.refresh();
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    await deleteAccountAction();
    window.location.href = "/";
  };

  return (
    <div className="space-y-8">
      {/* Main Profile Info Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            fullName={profile.full_name}
          />
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl font-bold text-slate-900">{profile.full_name}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#1853DB] text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Registered Commuter</span>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <Input
                name="fullName"
                defaultValue={profile.full_name}
                required
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phone Number (10 digits)
              </label>
              <Input
                name="phone"
                defaultValue={profile.phone || ""}
                placeholder="e.g. 9822012345"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bio / Daily Commute Route
            </label>
            <Input
              name="bio"
              defaultValue={profile.bio || ""}
              placeholder="e.g. Daily commuter between Gangapur Road and Satpur MIDC."
              maxLength={280}
            />
          </div>

          <div className="space-y-1 sm:w-1/2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Preferred Language
            </label>
            <select
              name="preferredLanguage"
              defaultValue={profile.preferred_language || "en"}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (हिं)</option>
              <option value="mr">मराठी (मरा)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#1853DB] hover:bg-blue-700 text-white font-semibold text-xs h-10 px-6 rounded-xl gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Emergency Contacts Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft">
        <EmergencyContactsManager contacts={contacts} />
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6 space-y-3">
        <h4 className="text-sm font-bold text-red-900">Danger Zone</h4>
        <p className="text-xs text-red-700 leading-relaxed">
          Requesting account deletion will soft-delete your personal information and profile. Your past ride records and coordination messages will be archived and anonymized for safety audit trails.
        </p>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          className="text-xs gap-1.5 rounded-xl font-semibold bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete My Account</span>
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Are you sure?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will mark your account as deleted and log you out immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                className="text-xs bg-red-600"
              >
                Confirm Deletion
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
