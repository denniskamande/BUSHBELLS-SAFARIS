import { useEffect, useState } from "react";
import { destinations as bundledDestinations, type SafariDestination } from "@/lib/safaris";
import { listManagedDestinations } from "@/lib/destination-service";

let destinationRequest: Promise<SafariDestination[]> | undefined;

async function loadDestinations() {
  destinationRequest ??= listManagedDestinations()
    .then(({ data }) => data?.length ? data : bundledDestinations)
    .catch(() => bundledDestinations);
  return destinationRequest;
}

export async function getSafariDestinations() {
  return loadDestinations();
}

export function useSafariDestinations() {
  const [destinations, setDestinations] = useState<SafariDestination[]>(bundledDestinations);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      destinationRequest = undefined;
      void loadDestinations().then((items) => {
        if (active) setDestinations(items);
      });
    };

    refresh();
    window.addEventListener("managed-destinations-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("managed-destinations-updated", refresh);
    };
  }, []);

  return destinations;
}
