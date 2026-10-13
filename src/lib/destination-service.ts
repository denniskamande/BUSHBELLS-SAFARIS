import { getSupabaseClient } from "@/lib/gallery-service";
import type { SafariDestination } from "@/lib/safaris";

type DestinationRow = {
  id: string;
  sort_order: number;
  destination_data: SafariDestination;
};

export async function listManagedDestinations() {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: new Error("Supabase is not configured.") };

  const { data, error } = await supabase
    .from("safari_destinations")
    .select("id, sort_order, destination_data")
    .order("sort_order", { ascending: true });

  return {
    data:
      (data as DestinationRow[] | null)?.map((row) => ({
        ...row.destination_data,
        sort_order: row.sort_order,
      })) ?? null,
    error,
  };
}

export async function saveManagedDestination(destination: SafariDestination, sortOrder: number) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("safari_destinations").upsert(
    {
      id: destination.id,
      sort_order: sortOrder,
      destination_data: destination,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function saveManagedDestinations(destinations: SafariDestination[]) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("safari_destinations").upsert(
    destinations.map((destination, index) => ({
      id: destination.id,
      sort_order: destination.sort_order ?? index,
      destination_data: destination,
    })),
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function deleteManagedDestination(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("safari_destinations").delete().eq("id", id);
  if (error) throw error;
}

export function notifyDestinationChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("managed-destinations-updated"));
}
