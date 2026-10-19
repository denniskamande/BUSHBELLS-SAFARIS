import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const bucket = "gallery";
const maxGalleryFileBytes = 15 * 1024 * 1024;
export type GalleryPhoto = {
  id: string;
  storage_path: string;
  media_type?: "image" | "video";
  caption: string;
  alt_text: string;
  destination_id?: string | null;
  highlight?: string | null;
  sort_order: number;
  created_at: string;
};

let client: SupabaseClient | null | undefined;

export function getSupabaseClient() {
  if (client !== undefined) return client;
  const url = import.meta.env["VITE_SUPABASE_URL"];
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  client = url && key ? createClient(url, key) : null;
  return client;
}

export function galleryPhotoUrl(path: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return "";
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function listGalleryPhotos() {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: new Error("Gallery storage is not configured.") };
  return supabase
    .from("gallery_photos")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
}

export async function listDestinationPhotos(destinationId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: new Error("Gallery storage is not configured.") };
  return supabase
    .from("gallery_photos")
    .select("*")
    .eq("destination_id", destinationId)
    .not("highlight", "is", null)
    .order("sort_order")
    .order("created_at", { ascending: false });
}

export async function uploadGalleryPhoto(
  file: File,
  caption: string,
  altText: string,
  destinationId?: string,
  highlight?: string,
) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Gallery storage is not configured.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in before uploading photos.");

  const uploadFile = file.type.startsWith("video/") ? file : await prepareGalleryImage(file);
  const isVideo = uploadFile.type.startsWith("video/");
  if (!isVideo && !uploadFile.type.startsWith("image/")) {
    throw new Error("Choose a JPG, PNG, WebP, AVIF, GIF, MP4 or WebM file.");
  }
  if (isVideo && !["video/mp4", "video/webm"].includes(uploadFile.type)) {
    throw new Error("Choose an MP4 or WebM video.");
  }
  if (uploadFile.size > maxGalleryFileBytes) {
    throw new Error(
      "Each file must be 15 MB or smaller. Large photos are compressed automatically.",
    );
  }

  const extension = uploadFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, uploadFile, {
    contentType: uploadFile.type,
    upsert: false,
  });
  if (uploadError) throw explainStorageError(uploadError.message);

  const { data, error } = await supabase
    .from("gallery_photos")
    .insert({
      storage_path: path,
      media_type: isVideo ? "video" : "image",
      caption,
      alt_text: altText,
      destination_id: !isVideo ? destinationId || null : null,
      highlight: !isVideo ? highlight || null : null,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(bucket).remove([path]);
    throw explainStorageError(error.message);
  }
  return data as GalleryPhoto;
}

const photoTypesByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

async function prepareGalleryImage(file: File): Promise<File> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = file.type || photoTypesByExtension[extension] || "";
  const regularTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
  const needsConversion = !regularTypes.includes(mimeType);
  if (!mimeType.startsWith("image/")) {
    throw new Error("Choose a photo file (JPG, PNG, WebP, AVIF or GIF).");
  }
  if (!needsConversion && file.size <= maxGalleryFileBytes) {
    return new File([file], file.name, { type: mimeType, lastModified: file.lastModified });
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    if (
      extension === "heic" ||
      extension === "heif" ||
      mimeType === "image/heic" ||
      mimeType === "image/heif"
    ) {
      throw new Error(
        "This HEIC/HEIF photo cannot be opened by this browser. Save or export it as JPG, then upload it again.",
      );
    }
    throw new Error("This photo format could not be read. Save it as JPG or PNG and try again.");
  }

  try {
    let scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare this photo.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", Math.max(0.55, 0.86 - attempt * 0.045)),
      );
      if (blob && blob.size <= maxGalleryFileBytes) {
        const baseName = file.name.replace(/\.[^.]+$/, "") || "safari-photo";
        return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
      }
      scale *= 0.82;
    }
  } finally {
    bitmap.close();
  }
  throw new Error("This photo is too large to compress to the 15 MB upload limit.");
}

function explainStorageError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("row-level security") || lower.includes("permission denied")) {
    return new Error(
      "Supabase rejected the upload permission. Confirm this account is in public.gallery_admins and run the latest supabase/gallery-setup.sql script.",
    );
  }
  if (lower.includes("mime") || lower.includes("content type")) {
    return new Error(
      "Supabase rejected this photo format. Run the latest supabase/gallery-setup.sql script, then try again with JPG, PNG, WebP, AVIF or GIF.",
    );
  }
  if (lower.includes("bucket") && lower.includes("not found")) {
    return new Error(
      "The gallery storage bucket is missing. Run supabase/gallery-setup.sql in Supabase.",
    );
  }
  return new Error(`Photo upload failed: ${message}`);
}

export async function deleteGalleryPhoto(photo: GalleryPhoto) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Gallery storage is not configured.");
  const { error: rowError } = await supabase.from("gallery_photos").delete().eq("id", photo.id);
  if (rowError) throw rowError;
  const { error: fileError } = await supabase.storage.from(bucket).remove([photo.storage_path]);
  if (fileError) throw fileError;
}

export async function saveGalleryOrder(photos: GalleryPhoto[]) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Gallery storage is not configured.");
  for (const [sort_order, photo] of photos.entries()) {
    const { error } = await supabase
      .from("gallery_photos")
      .update({ sort_order })
      .eq("id", photo.id);
    if (error) throw error;
  }
}
