"use client";

import * as React from "react";
import { uploadAvatarAction } from "@/app/actions/profile";
import { Camera, RotateCw, User } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  fullName: string;
}

export function AvatarUpload({ currentAvatarUrl, fullName }: AvatarUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(currentAvatarUrl || null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar image must be under 2 MB.");
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await uploadAvatarAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to upload avatar.");
    } else if (res.avatarUrl) {
      setPreview(res.avatarUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center relative shadow-sm">
          {preview ? (
            <Image
              src={preview}
              alt={fullName}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <User className="w-10 h-10 text-slate-400" />
          )}

          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
              <RotateCw className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label="Change profile picture"
          className="absolute bottom-0 right-0 p-2 rounded-full bg-[#1853DB] text-white hover:bg-blue-700 shadow-md transition-transform group-hover:scale-105"
        >
          <Camera className="w-4 h-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">Square JPEG, PNG, or WebP. Max 2 MB.</p>
        {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}

