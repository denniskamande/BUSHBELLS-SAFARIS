import { getSupabaseClient } from "@/lib/gallery-service";
import type { SafariPackage } from "@/lib/operator-tours";

type PackageRow = { id: string; package_data: SafariPackage };

export async function listManagedPackages() {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: new Error("Supabase is not configured.") };

  const { data, error } = await supabase
    .from("safari_packages")
    .select("id, package_data")
    .order("days", { ascending: true });
  return {
    data: (data as PackageRow[] | null)?.map((row) => row.package_data) ?? null,
    error,
  };
}

export async function saveManagedPackage(safari: SafariPackage) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase
    .from("safari_packages")
    .upsert({ id: safari.id, days: safari.days, package_data: safari }, { onConflict: "id" });
  if (error) throw error;
}

export async function saveManagedPackages(safaris: SafariPackage[]) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("safari_packages").upsert(
    safaris.map((safari) => ({ id: safari.id, days: safari.days, package_data: safari })),
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function deleteManagedPackage(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("safari_packages").delete().eq("id", id);
  if (error) throw error;
}

export function notifyPackageChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("managed-safaris-updated"));
}
