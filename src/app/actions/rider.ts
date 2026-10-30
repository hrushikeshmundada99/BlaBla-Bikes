"use server";

import { createClient } from "@/lib/supabase/server";
import { riderOnboardingSchema } from "@/lib/validations/rider";
import { validateMagicBytes, generateSafeStoragePath, getSignedDocumentUrl } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./auth";

export async function submitRiderOnboardingAction(
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

  const bikeModel = formData.get("bikeModel") as string;
  const registrationNumber = formData.get("registrationNumber") as string;
  const licenceNumber = formData.get("licenceNumber") as string;
  const helmetAvailable = formData.get("helmetAvailable") === "true";

  const validated = riderOnboardingSchema.safeParse({
    bikeModel,
    registrationNumber,
    licenceNumber,
    helmetAvailable,
  });

  if (!validated.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  // Handle Document Uploads (Licence & RC required, Bike photo optional)
  const licenceDoc = formData.get("licenceDoc") as File | null;
  const rcDoc = formData.get("rcDoc") as File | null;
  const bikePhoto = formData.get("bikePhoto") as File | null;

  if (!licenceDoc || licenceDoc.size === 0) {
    return { success: false, error: "Driving licence document is required." };
  }

  if (!rcDoc || rcDoc.size === 0) {
    return { success: false, error: "Vehicle Registration Certificate (RC) document is required." };
  }

  const maxFileSize = 5 * 1024 * 1024; // 5 MB

  if (licenceDoc.size > maxFileSize || rcDoc.size > maxFileSize) {
    return { success: false, error: "Documents must be less than 5 MB each." };
  }

  // Validate licence doc magic bytes
  const licenceBytes = new Uint8Array(await licenceDoc.arrayBuffer());
  const licenceMagic = validateMagicBytes(licenceBytes);
  if (!licenceMagic.isValid || !licenceMagic.mimeType) {
    return { success: false, error: "Invalid licence document. Only JPEG, PNG, WebP, and PDF are allowed." };
  }

  // Validate RC doc magic bytes
  const rcBytes = new Uint8Array(await rcDoc.arrayBuffer());
  const rcMagic = validateMagicBytes(rcBytes);
  if (!rcMagic.isValid || !rcMagic.mimeType) {
    return { success: false, error: "Invalid RC document. Only JPEG, PNG, WebP, and PDF are allowed." };
  }

  // Upload Licence
  const licencePath = generateSafeStoragePath(user.id, "licence", licenceMagic.mimeType);
  const { error: licenceUploadErr } = await supabase.storage
    .from("rider-docs")
    .upload(licencePath, licenceBytes, { contentType: licenceMagic.mimeType, upsert: true });

  if (licenceUploadErr) {
    console.error("Licence upload error:", licenceUploadErr);
    return { success: false, error: "Failed to upload driving licence document." };
  }

  // Upload RC
  const rcPath = generateSafeStoragePath(user.id, "rc", rcMagic.mimeType);
  const { error: rcUploadErr } = await supabase.storage
    .from("rider-docs")
    .upload(rcPath, rcBytes, { contentType: rcMagic.mimeType, upsert: true });

  if (rcUploadErr) {
    console.error("RC upload error:", rcUploadErr);
    return { success: false, error: "Failed to upload RC document." };
  }

  // Optional Bike Photo
  let bikePhotoPath: string | null = null;
  if (bikePhoto && bikePhoto.size > 0) {
    if (bikePhoto.size <= maxFileSize) {
      const bikeBytes = new Uint8Array(await bikePhoto.arrayBuffer());
      const bikeMagic = validateMagicBytes(bikeBytes);
      if (bikeMagic.isValid && bikeMagic.mimeType && bikeMagic.mimeType !== "application/pdf") {
        bikePhotoPath = generateSafeStoragePath(user.id, "bike", bikeMagic.mimeType);
        await supabase.storage
          .from("rider-docs")
          .upload(bikePhotoPath, bikeBytes, { contentType: bikeMagic.mimeType, upsert: true });
      }
    }
  }

  // Upsert into rider_profiles
  const { error: upsertErr } = await supabase.from("rider_profiles").upsert(
    {
      user_id: user.id,
      bike_model: validated.data.bikeModel,
      registration_number: validated.data.registrationNumber,
      licence_number: validated.data.licenceNumber,
      helmet_available: validated.data.helmetAvailable,
      licence_doc_path: licencePath,
      rc_doc_path: rcPath,
      bike_photo_path: bikePhotoPath,
      verification: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (upsertErr) {
    console.error("Rider profile upsert error:", upsertErr);
    if (upsertErr.message.includes("registration_number")) {
      return { success: false, error: "This vehicle registration number is already registered." };
    }
    if (upsertErr.message.includes("licence_number")) {
      return { success: false, error: "This driving licence number is already registered." };
    }
    return { success: false, error: "Failed to submit rider onboarding details." };
  }

  revalidatePath("/onboarding/rider");
  revalidatePath("/profile");
  return {
    success: true,
    message: "Rider documents submitted successfully! Your application is under review.",
  };
}

export async function getRiderDocUrl(docType: "licence" | "rc" | "bike"): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: riderProfile } = await supabase
    .from("rider_profiles")
    .select("licence_doc_path, rc_doc_path, bike_photo_path")
    .eq("user_id", user.id)
    .single();

  if (!riderProfile) return null;

  const path =
    docType === "licence"
      ? riderProfile.licence_doc_path
      : docType === "rc"
      ? riderProfile.rc_doc_path
      : riderProfile.bike_photo_path;

  if (!path) return null;

  return await getSignedDocumentUrl(path, 300);
}

