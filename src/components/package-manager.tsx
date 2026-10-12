import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { destinations, packages as bundledPackages } from "@/lib/safaris";
import { galleryPhotoUrl, listGalleryPhotos, type GalleryPhoto } from "@/lib/gallery-service";
import {
  deleteManagedPackage,
  listManagedPackages,
  notifyPackageChange,
  saveManagedPackage,
  saveManagedPackages,
} from "@/lib/package-service";
import { operatorTours, type SafariPackage } from "@/lib/operator-tours";

function blankPackage(): SafariPackage {
  return {
    id: "",
    n: "",
    duration: "3 days",
    days: 3,
    priceEstimate: "",
    ds: [],
    t: "",
    h: 200,
    it: [["", ""]],
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

export function PackageManager() {
  const [safaris, setSafaris] = useState<SafariPackage[]>(operatorTours);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<SafariPackage>(blankPackage);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const { data, error: loadError } = await listManagedPackages();
        if (!alive) return;
        if (loadError) {
          setError("Safari storage is not set up yet. Run supabase/package-manager-setup.sql in your Supabase SQL Editor, then reload this page.");
        } else if (!data?.length) {
          await saveManagedPackages(operatorTours);
          if (alive) {
            setSafaris(operatorTours);
            setNotice("Your existing safari list is ready to manage.");
          }
        } else {
          setSafaris(data);
        }
      } catch (reason) {
        if (alive) setError(reason instanceof Error ? reason.message : "Could not load the safari list.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    void listGalleryPhotos()
      .then(({ data }) => {
        if (alive) setPhotos((data ?? []) as GalleryPhoto[]);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const selected = useMemo(
    () => safaris.find((safari) => safari.id === selectedId),
    [safaris, selectedId],
  );

  function chooseSafari(id: string) {
    setSelectedId(id);
    const found = safaris.find((safari) => safari.id === id);
    setDraft(found ? { ...found, it: found.it.map((day) => [...day] as [string, string]) } : blankPackage());
    setNotice("");
    setError("");
  }

  function updateDraft<K extends keyof SafariPackage>(key: K, value: SafariPackage[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = selected ? selected.id : slugify(draft.n);
    if (!id) {
      setError("Enter a safari name to create its page address.");
      return;
    }
    if (!draft.ds.length) {
      setError("Choose at least one destination.");
      return;
    }
    const cleanItinerary = draft.it
      .map(([title, description]) => [title.trim(), description.trim()] as [string, string])
      .filter(([title, description]) => title || description);
    if (!cleanItinerary.length) {
      setError("Add at least one itinerary day.");
      return;
    }
    const days = Number(draft.days);
    const safari: SafariPackage = {
      ...draft,
      id,
      n: draft.n.trim(),
      days,
      duration: days === 0.5 ? "Half day" : `${days} ${days === 1 ? "day" : "days"}`,
      priceEstimate: draft.priceEstimate.trim(),
      t: draft.t.trim(),
      ds: [...draft.ds],
      it: cleanItinerary,
    };
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await saveManagedPackage(safari);
      const next = [...safaris.filter((item) => item.id !== safari.id), safari].sort((a, b) => a.days - b.days);
      setSafaris(next);
      setSelectedId(safari.id);
      setDraft(safari);
      notifyPackageChange();
      setNotice("Safari saved. It is now available on the website.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this safari.");
    } finally {
      setBusy(false);
    }
  }

  async function removeSafari() {
    if (!selected || safaris.length <= 1) return;
    if (!window.confirm(`Remove “${selected.n}” from the website?`)) return;
    setBusy(true);
    setError("");
    try {
      await deleteManagedPackage(selected.id);
      const next = safaris.filter((item) => item.id !== selected.id);
      setSafaris(next);
      chooseSafari(next[0]?.id ?? "");
      notifyPackageChange();
      setNotice("Safari removed from the website.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove this safari.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="package-manager" aria-labelledby="package-manager-title">
      <div className="admin-toolbar">
        <div>
          <h2 id="package-manager-title">Manage safaris</h2>
          <p>Add or update safari details, itinerary days, destinations and a gallery cover photo.</p>
        </div>
        <Button variant="forest" disabled={busy || loading} onClick={() => chooseSafari("")}>
          <Plus /> New safari
        </Button>
      </div>

      {loading ? <p className="admin-note" role="status">Loading safaris…</p> : (
        <>
          {safaris.length > 0 && (
            <div className="package-manager-select">
              <label htmlFor="managed-safari">Choose a safari to edit</label>
              <select id="managed-safari" value={selectedId} onChange={(event) => chooseSafari(event.target.value)}>
                <option value="">New safari</option>
                {safaris.map((safari) => <option key={safari.id} value={safari.id}>{safari.n}</option>)}
              </select>
            </div>
          )}
          <form className="enquiry-panel package-editor" onSubmit={save}>
            <h3>{selected ? "Edit safari" : "Create a safari"}</h3>
            <div className="form-grid">
              <div className="form-wide">
                <label htmlFor="safari-name">Safari name</label>
                <input id="safari-name" required value={draft.n} onChange={(event) => updateDraft("n", event.target.value)} placeholder="e.g. 5-Day Mara and Lake Safari" />
              </div>
              <div>
                <label htmlFor="safari-days">Duration in days</label>
                <input id="safari-days" type="number" min="0.5" step="0.5" required value={draft.days} onChange={(event) => updateDraft("days", Number(event.target.value))} />
              </div>
              <div>
                <label htmlFor="safari-price">Estimated price per person</label>
                <input id="safari-price" value={draft.priceEstimate} onChange={(event) => updateDraft("priceEstimate", event.target.value)} placeholder="e.g. $1,200–$1,600" />
              </div>
              <div className="form-wide">
                <label htmlFor="safari-intro">Short description</label>
                <textarea id="safari-intro" required rows={4} value={draft.t} onChange={(event) => updateDraft("t", event.target.value)} />
              </div>
              <fieldset className="form-wide package-destination-options">
                <legend>Destinations on this safari</legend>
                {destinations.map((destination) => (
                  <label key={destination.id}>
                    <input
                      type="checkbox"
                      checked={draft.ds.includes(destination.id)}
                      onChange={(event) => updateDraft("ds", event.target.checked
                        ? [...draft.ds, destination.id]
                        : draft.ds.filter((id) => id !== destination.id))}
                    />
                    {destination.n} <small>{destination.c}</small>
                  </label>
                ))}
              </fieldset>
              <div className="form-wide">
                <label htmlFor="safari-cover">Cover photo from your gallery</label>
                <select id="safari-cover" value={draft.imageUrl ?? ""} onChange={(event) => updateDraft("imageUrl", event.target.value || undefined)}>
                  <option value="">Use the website’s default safari photo</option>
                  {photos.map((photo) => <option key={photo.id} value={galleryPhotoUrl(photo.storage_path)}>{photo.caption}</option>)}
                </select>
                {!photos.length && <small><ImagePlus size={14} /> Upload photos in the Gallery tab first, then choose one here.</small>}
              </div>
            </div>

            <div className="package-itinerary-editor">
              <div className="admin-toolbar">
                <div><h3>Day-by-day itinerary</h3><p>Add a heading and description for each day.</p></div>
                <Button type="button" variant="outline" onClick={() => updateDraft("it", [...draft.it, ["", ""]])}><Plus /> Add day</Button>
              </div>
              {draft.it.map(([title, description], index) => (
                <div className="package-day-editor" key={`day-${index}`}>
                  <strong>{draft.days === 0.5 ? "Half-day" : `Day ${index + 1}`}</strong>
                  <label>
                    <span>Day heading</span>
                    <input required value={title} onChange={(event) => updateDraft("it", draft.it.map((day, dayIndex) => dayIndex === index ? [event.target.value, day[1]] : day))} placeholder="e.g. Nairobi to the Masai Mara" />
                  </label>
                  <label>
                    <span>What happens this day?</span>
                    <textarea required rows={3} value={description} onChange={(event) => updateDraft("it", draft.it.map((day, dayIndex) => dayIndex === index ? [day[0], event.target.value] : day))} />
                  </label>
                  <Button type="button" variant="outline" size="icon" aria-label={`Remove day ${index + 1}`} disabled={draft.it.length <= 1} onClick={() => updateDraft("it", draft.it.filter((_, dayIndex) => dayIndex !== index))}><Trash2 /></Button>
                </div>
              ))}
            </div>

            {notice && <p className="admin-notice" role="status">{notice}</p>}
            {error && <p className="admin-error" role="alert">{error}</p>}
            <div className="package-editor-actions">
              <Button type="submit" variant="forest" disabled={busy || loading}><Save /> {busy ? "Saving…" : "Save safari"}</Button>
              {selected && <Button type="button" variant="outline" disabled={busy || safaris.length <= 1} onClick={() => void removeSafari()}><Trash2 /> Remove safari</Button>}
            </div>
          </form>
          <p className="admin-note">The existing {bundledPackages.length} safaris were copied into the admin catalogue on first setup. New and edited safaris appear on the public website after saving.</p>
        </>
      )}
    </section>
  );
}
