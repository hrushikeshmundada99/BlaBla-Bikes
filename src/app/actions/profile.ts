"use server";

import { createClient } from "@/lib/supabase/server";
import { profileSchema, emergencyContactSchema } from "@/lib/validations/profile";
import { validateMagicBytes, generateSafeStoragePath } from "@/lib/storage";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./auth";

export async function updateProfileAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const fullName = formData.get("fullName") as string;
  const bio = formData.get("bio") as string;
  const phone = formData.get("phone") as string;
  const preferredLanguage = formData.get("preferredLanguage") as "en" | "hi" | "mr";

  const validated = profileSchema.safeParse({
    fullName,
    bio,
    phone,
    preferredLanguage,
  });

  if (!validated.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: validated.data.fullName,
      bio: validated.data.bio || null,
      phone: validated.data.phone || null,
      preferred_language: validated.data.preferredLanguage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile." };
  }

  // Sync preferred language with next-intl cookie
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", validated.data.preferredLanguage, {
    maxAge: 31536000,
    path: "/",
    sameSite: "lax",
  });

  revalidatePath("/profile");
  return { success: true, message: "Profile updated successfully." };
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResponse & { avatarUrl?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Please select an image file to upload." };
  }

  // Size limit: 2 MB
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "Avatar image must be under 2 MB." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { isValid, mimeType } = validateMagicBytes(bytes);

  if (!isValid || !mimeType || mimeType === "application/pdf") {
    return { success: false, error: "Invalid image format. Only JPEG, PNG, and WebP images are allowed." };
  }

  const storagePath = generateSafeStoragePath(user.id, "avatar", mimeType);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(storagePath, bytes, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError);
    return { success: false, error: "Failed to upload avatar image." };
  }

  const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(storagePath);
  const avatarUrl = publicUrlData.publicUrl;

  // Update profile
  await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  revalidatePath("/profile");
  return { success: true, message: "Avatar updated successfully.", avatarUrl };
}

export async function addEmergencyContactAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  const validated = emergencyContactSchema.safeParse({ name, phone, email });
  if (!validated.success) {
    return {
      success: false,
      error: "Please provide a valid name and 10-digit Indian phone number.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.from("emergency_contacts").insert({
    user_id: user.id,
    name: validated.data.name,
    phone: validated.data.phone,
    email: validated.data.email || null,
  });

  if (error) {
    if (error.message.includes("Maximum limit of 3")) {
      return { success: false, error: "Maximum limit of 3 emergency contacts reached." };
    }
    return { success: false, error: "Failed to add emergency contact." };
  }

  revalidatePath("/profile");
  return { success: true, message: "Emergency contact added successfully." };
}

export async function deleteEmergencyContactAction(contactId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", contactId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: "Failed to delete emergency contact." };
  }

  revalidatePath("/profile");
  return { success: true, message: "Contact removed." };
}

export async function deleteAccountAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized." };
  }

  // Soft delete user profile
  await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", user.id);

  await supabase.auth.signOut();
  return { success: true, message: "Your account has been deleted." };
}

