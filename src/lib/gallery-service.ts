import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const bucket = "gallery";
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
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
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

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "video/mp4",
    "video/webm",
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP, AVIF, MP4 or WebM file.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error(
      "Each gallery file must be 15 MB or smaller. Compress larger videos before uploading.",
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("gallery_photos")
    .insert({
      storage_path: path,
      media_type: file.type.startsWith("video/") ? "video" : "image",
      caption,
      alt_text: altText,
      destination_id: file.type.startsWith("image/") ? destinationId || null : null,
      highlight: file.type.startsWith("image/") ? highlight || null : null,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(bucket).remove([path]);
    throw error;
  }
  return data as GalleryPhoto;
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
