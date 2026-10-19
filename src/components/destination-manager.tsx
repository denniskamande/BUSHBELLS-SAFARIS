import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { destinations as bundledDestinations, type SafariDestination } from "@/lib/safaris";
import {
  deleteManagedDestination,
  listManagedDestinations,
  notifyDestinationChange,
  saveManagedDestination,
  saveManagedDestinations,
} from "@/lib/destination-service";
import { listManagedPackages } from "@/lib/package-service";
import { operatorTours } from "@/lib/operator-tours";
import {
  galleryPhotoUrl,
  listGalleryPhotos,
  uploadGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/gallery-service";

function blankDestination(): SafariDestination {
  return {
    id: "",
    n: "",
    c: "Kenya",
    e: "📍",
    h: 200,
    t: "",
    d: "",
    b: "Year-round",
    l: [""],
    imageUrl: "",
    sort_order: bundledDestinations.length,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function DestinationManager() {
  const [destinations, setDestinations] = useState<SafariDestination[]>(
    bundledDestinations as SafariDestination[],
  );
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<SafariDestination>(blankDestination);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data, error: loadError } = await listManagedDestinations();
        if (!active) return;
        if (loadError) {
          setError(
            "Destination storage is not set up yet. Run the updated supabase/package-manager-setup.sql in Supabase, then reload this page.",
          );
        } else if (!data?.length) {
          const defaults = bundledDestinations as SafariDestination[];
          await saveManagedDestinations(defaults);
          if (active) {
            setDestinations(defaults);
            setNotice("Your existing destinations are ready to manage.");
          }
        } else {
          setDestinations(data);
        }
      } catch (reason) {
        if (active)
          setError(reason instanceof Error ? reason.message : "Could not load destinations.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    void listGalleryPhotos()
      .then(({ data }) => {
        if (active) setPhotos((data ?? []) as GalleryPhoto[]);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(
    () => destinations.find((destination) => destination.id === selectedId),
    [destinations, selectedId],
  );

  function chooseDestination(id: string) {
    setSelectedId(id);
    const found = destinations.find((destination) => destination.id === id);
    setDraft(found ? { ...found, l: [...found.l] } : blankDestination());
    setError("");
    setNotice("");
  }

  function updateDraft<K extends keyof SafariDestination>(key: K, value: SafariDestination[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const title = draft.n.trim() || "Destination";
      const photo = await uploadGalleryPhoto(file, `${title} destination`, `${title} destination`);
      setPhotos((current) => [photo, ...current]);
      updateDraft("imageUrl", galleryPhotoUrl(photo.storage_path));
      setNotice("Photo uploaded and selected. Save the destination to publish it.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not upload the destination photo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = selected ? selected.id : slugify(draft.n);
    if (!id) {
      setError("Enter a destination name to create its page address.");
      return;
    }
    const highlights = draft.l.map((item) => item.trim()).filter(Boolean);
    if (!highlights.length) {
      setError("Add at least one destination highlight.");
      return;
    }

    const destination: SafariDestination = {
      ...draft,
      id,
      n: draft.n.trim(),
      c: draft.c.trim(),
      e: draft.e.trim() || "📍",
      t: draft.t.trim(),
      d: draft.d.trim(),
      b: draft.b.trim(),
      l: highlights,
      imageUrl: draft.imageUrl ?? "",
    };
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const currentIndex = destinations.findIndex((item) => item.id === id);
      const sortOrder = currentIndex >= 0 ? currentIndex : destinations.length;
      await saveManagedDestination(destination, sortOrder);
      const next = [...destinations.filter((item) => item.id !== id), destination];
      setDestinations(next);
      setSelectedId(id);
      setDraft(destination);
      notifyDestinationChange();
      setNotice("Destination saved and published on the website.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this destination.");
    } finally {
      setBusy(false);
    }
  }

  async function removeDestination() {
    if (!selected || destinations.length <= 1) return;
    if (!window.confirm(`Remove “${selected.n}” from the website?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data: safaris, error: safariError } = await listManagedPackages();
      if (safariError) throw safariError;
      const safariCatalogue = safaris?.length ? safaris : operatorTours;
      if (safariCatalogue.some((safari) => safari.ds.includes(selected.id))) {
        setError(
          "This destination is used by one or more safaris. Remove it from those safari itineraries first, then try again.",
        );
        return;
      }
      await deleteManagedDestination(selected.id);
      const next = destinations.filter((item) => item.id !== selected.id);
      setDestinations(next);
      setSelectedId("");
      setDraft(blankDestination());
      notifyDestinationChange();
      setNotice("Destination removed from the website.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove this destination.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="package-manager" aria-labelledby="destination-manager-title">
      <div className="admin-toolbar">
        <div>
          <h2 id="destination-manager-title">Manage destinations</h2>
          <p>
            Add places, edit their details and highlights, choose photos, or remove destinations.
          </p>
        </div>
        <Button variant="forest" disabled={busy || loading} onClick={() => chooseDestination("")}>
          <Plus /> New destination
        </Button>
      </div>

      {loading ? (
        <p className="admin-note" role="status">
          Loading destinations…
        </p>
      ) : (
        <>
          {destinations.length > 0 && (
            <div className="package-manager-select">
              <label htmlFor="managed-destination">Choose a destination to edit</label>
              <select
                id="managed-destination"
                value={selectedId}
                onChange={(event) => chooseDestination(event.target.value)}
              >
                <option value="">New destination</option>
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.n} · {destination.c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form className="enquiry-panel package-editor" onSubmit={save}>
            <h3>{selected ? "Edit destination" : "Create a destination"}</h3>
            <div className="form-grid">
              <div className="form-wide">
                <label htmlFor="destination-name">Destination name</label>
                <input
                  id="destination-name"
                  required
                  value={draft.n}
                  onChange={(event) => updateDraft("n", event.target.value)}
                  placeholder="e.g. Lake Turkana"
                />
              </div>
              <div>
                <label htmlFor="destination-country">Country</label>
                <select
                  id="destination-country"
                  value={draft.c}
                  onChange={(event) => updateDraft("c", event.target.value)}
                >
                  <option>Kenya</option>
                  <option>Uganda</option>
                  <option>Tanzania</option>
                </select>
              </div>
              <div>
                <label htmlFor="destination-icon">Small icon or emoji</label>
                <input
                  id="destination-icon"
                  value={draft.e}
                  onChange={(event) => updateDraft("e", event.target.value)}
                  maxLength={8}
                  placeholder="🦁"
                />
              </div>
              <div className="form-wide">
                <label htmlFor="destination-tagline">Short description</label>
                <input
                  id="destination-tagline"
                  required
                  value={draft.t}
                  onChange={(event) => updateDraft("t", event.target.value)}
                />
              </div>
              <div className="form-wide">
                <label htmlFor="destination-description">Full description</label>
                <textarea
                  id="destination-description"
                  required
                  rows={5}
                  value={draft.d}
                  onChange={(event) => updateDraft("d", event.target.value)}
                />
              </div>
              <div className="form-wide">
                <label htmlFor="destination-season">Best time to visit</label>
                <input
                  id="destination-season"
                  value={draft.b ?? ""}
                  onChange={(event) => updateDraft("b", event.target.value)}
                  placeholder="e.g. June to October"
                />
              </div>
              <div className="form-wide">
                <label htmlFor="destination-highlights">Highlights (one per line)</label>
                <textarea
                  id="destination-highlights"
                  required
                  rows={5}
                  value={draft.l.join("\n")}
                  onChange={(event) => updateDraft("l", event.target.value.split("\n"))}
                  placeholder={"Wildlife viewing\nScenic landscapes\nLocal culture"}
                />
              </div>
              <div className="form-wide">
                <label htmlFor="destination-cover">Choose a cover photo</label>
                <select
                  id="destination-cover"
                  value={draft.imageUrl ?? ""}
                  onChange={(event) => updateDraft("imageUrl", event.target.value || undefined)}
                >
                  <option value="">Use the website’s default destination photo</option>
                  {photos
                    .filter((photo) => photo.media_type !== "video")
                    .map((photo) => (
                      <option key={photo.id} value={galleryPhotoUrl(photo.storage_path)}>
                        {photo.caption}
                      </option>
                    ))}
                </select>
                <label htmlFor="destination-cover-upload" className="package-cover-upload-label">
                  <ImagePlus size={14} /> Or upload a new destination photo
                </label>
                <input
                  id="destination-cover-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = "";
                    void uploadCover(file);
                  }}
                />
                {draft.imageUrl && (
                  <img
                    className="package-cover-preview"
                    src={draft.imageUrl}
                    alt="Selected destination cover preview"
                  />
                )}
              </div>
            </div>

            {notice && (
              <p className="admin-notice" role="status">
                {notice}
              </p>
            )}
            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}
            <div className="package-editor-actions">
              <Button type="submit" variant="forest" disabled={busy || loading}>
                <Save /> {busy ? "Saving…" : "Save destination"}
              </Button>
              {selected && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy || destinations.length <= 1}
                  onClick={() => void removeDestination()}
                >
                  <Trash2 /> Remove destination
                </Button>
              )}
            </div>
          </form>
          <p className="admin-note">
            Photos uploaded here are also added to the Gallery. To remove a destination used in a
            safari, edit that safari first and remove the destination from its route.
          </p>
        </>
      )}
    </section>
  );
}
