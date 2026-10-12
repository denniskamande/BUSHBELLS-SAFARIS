import { useEffect, useState } from "react";
import { operatorTours, type SafariPackage } from "@/lib/operator-tours";
import { listManagedPackages } from "@/lib/package-service";

export function useSafariPackages() {
  const [safaris, setSafaris] = useState<SafariPackage[]>(operatorTours);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let current = true;
    const refresh = async () => {
      const { data } = await listManagedPackages();
      if (current) {
        if (data?.length) setSafaris(data);
        setLoaded(true);
      }
    };
    void refresh();
    window.addEventListener("managed-safaris-updated", refresh);
    return () => {
      current = false;
      window.removeEventListener("managed-safaris-updated", refresh);
    };
  }, []);

  return { safaris, loaded };
}
