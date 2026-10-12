import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ImagePlus, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/safari-site";
import {
  deleteGalleryPhoto,
  galleryPhotoUrl,
  getSupabaseClient,
  listGalleryPhotos,
  saveGalleryOrder,
  uploadGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/gallery-service";
import { destinations, pageHead } from "@/lib/safaris";
import { PackageManager } from "@/components/package-manager";

export const Route = createFileRoute("/admin")({
  head: () => pageHead("Safari and Gallery Admin", "Manage Bushbells Safaris photos and safari packages."),
  component: AdminPage,
});

function titleFromFile(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function AdminPage() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [adminAccess, setAdminAccess] = useState<"checking" | "allowed" | "denied">("checking");
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [placement, setPlacement] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"gallery" | "safaris">("gallery");

  const refreshPhotos = useCallback(async () => {
    const { data, error: loadError } = await listGalleryPhotos();
    if (loadError) throw loadError;
    setPhotos((data ?? []) as GalleryPhoto[]);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !signedIn) {
      setAdminAccess("checking");
      return;
    }

    let current = true;
    setAdminAccess("checking");
    void supabase.rpc("is_gallery_admin").then(({ data, error: accessError }) => {
      if (current) setAdminAccess(!accessError && data === true ? "allowed" : "denied");
    });
    return () => {
      current = false;
    };
  }, [supabase, signedIn]);

  useEffect(() => {
    if (!signedIn || adminAccess !== "allowed") {
      setPhotos([]);
      return;
    }
    void refreshPhotos().catch((reason: unknown) =>
      setError(reason instanceof Error ? reason.message : "Could not load the gallery."),
    );
  }, [signedIn, adminAccess, refreshPhotos]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setError("Gallery sign-in is currently unavailable. Please connect the gallery service first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError)
      setError(
        "Sign-in failed. Check your email and password, and confirm this account has gallery admin access.",
      );
    setBusy(false);
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("photos") as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) {
      setError("Choose at least one image to upload.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("Uploading photos…");
    try {
      const [destinationId, highlight] = placement ? placement.split("::") : ["", ""];
      for (const file of files) {
        const title = caption.trim() || titleFromFile(file.name);
        await uploadGalleryPhoto(file, title, altText.trim() || title, destinationId, highlight);
      }
      input.value = "";
      setCaption("");
      setAltText("");
      setPlacement("");
      await refreshPhotos();
      setNotice(
        `${files.length} ${files.length === 1 ? "photo was" : "photos were"} added to the gallery.`,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Photo upload failed.");
      setNotice("");
    } finally {
      setBusy(false);
    }
  }

  async function movePhoto(index: number, offset: -1 | 1) {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= photos.length) return;
    const currentPhoto = photos[index];
    const adjacentPhoto = photos[nextIndex];
    if (!currentPhoto || !adjacentPhoto) return;
    const reordered = [...photos];
    reordered[index] = adjacentPhoto;
    reordered[nextIndex] = currentPhoto;
    setBusy(true);
    setError("");
    try {
      await saveGalleryOrder(reordered);
      setPhotos(reordered);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save the new photo order.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto(photo: GalleryPhoto) {
    if (!window.confirm(`Remove “${photo.caption}” from the gallery?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await deleteGalleryPhoto(photo);
      await refreshPhotos();
      setNotice("Photo removed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove the photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <PageHeading
        title="Site admin"
        description="Manage gallery photos and create or update safari packages."
      />
      <section className="section">
        <div className="wrap admin-wrap">
          {!supabase || !signedIn ? (
            <form className="enquiry-panel admin-login" onSubmit={signIn}>
              <h2>Admin sign in</h2>
              <div>
                <label htmlFor="admin-email">Email address</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button variant="forest" type="submit" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
              <p className="admin-note">
                {supabase
                  ? "Sign in with your gallery admin account."
                  : "Gallery sign-in is not connected yet."}
              </p>
            </form>
          ) : adminAccess === "checking" ? (
            <p className="admin-note" role="status">Checking gallery admin access…</p>
          ) : adminAccess === "denied" ? (
            <div className="enquiry-panel admin-login" role="status">
              <h2>Admin access required</h2>
              <p>This account does not have permission to manage gallery photos or safaris.</p>
              <Button variant="outline" onClick={() => void supabase.auth.signOut()}>
                <LogOut /> Sign out
              </Button>
            </div>
          ) : (
            <>
              <div className="admin-section-tabs" role="tablist" aria-label="Admin sections">
                <Button role="tab" aria-selected={activeTab === "gallery"} variant={activeTab === "gallery" ? "forest" : "outline"} onClick={() => setActiveTab("gallery")}>Gallery</Button>
                <Button role="tab" aria-selected={activeTab === "safaris"} variant={activeTab === "safaris" ? "forest" : "outline"} onClick={() => setActiveTab("safaris")}>Safaris</Button>
                <Button className="admin-tab-signout" variant="outline" disabled={busy} onClick={() => void supabase.auth.signOut()}>
                  <LogOut /> Sign out
                </Button>
              </div>
              {activeTab === "safaris" ? <PackageManager /> : <>
              <div className="admin-toolbar">
                <div>
                  <h2>Manage gallery</h2>
                  <p>
                    {photos.length} uploaded {photos.length === 1 ? "photo" : "photos"}
                  </p>
                </div>
              </div>
              <form className="enquiry-panel admin-upload" onSubmit={upload}>
                <h2>
                  <ImagePlus /> Add photos
                </h2>
                <div className="form-grid">
                  <div className="form-wide">
                    <label htmlFor="gallery-files">Choose image files</label>
                    <input
                      id="gallery-files"
                      name="photos"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      multiple
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gallery-caption">Short description shown in the gallery</label>
                    <input
                      id="gallery-caption"
                      value={caption}
                      onChange={(event) => setCaption(event.target.value)}
                      placeholder="Optional; defaults to file name"
                    />
                  </div>
                  <div>
                    <label htmlFor="gallery-alt">Accessibility description</label>
                    <input
                      id="gallery-alt"
                      value={altText}
                      onChange={(event) => setAltText(event.target.value)}
                      placeholder="Optional; defaults to caption"
                    />
                  </div>
                  <div className="form-wide">
                    <label htmlFor="gallery-placement">Also show in a destination highlight</label>
                    <select
                      id="gallery-placement"
                      value={placement}
                      onChange={(event) => setPlacement(event.target.value)}
                    >
                      <option value="">Gallery only</option>
                      {destinations.map((destination) => (
                        <optgroup key={destination.id} label={destination.n}>
                          {destination.l.map((highlight) => (
                            <option
                              key={`${destination.id}::${highlight}`}
                              value={`${destination.id}::${highlight}`}
                            >
                              {highlight}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <Button variant="forest" type="submit" className="form-wide" disabled={busy}>
                    {busy ? "Working…" : "Upload photo"}
                  </Button>
                </div>
                <p className="admin-note">
                  Choose a destination highlight to show these photos there as well as in the main
                  gallery. You can select several images at once; the caption, description and
                  placement apply to all selected files.
                </p>
              </form>
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
              <div className="admin-photo-list">
                {photos.map((photo, index) => (
                  <article className="admin-photo" key={photo.id}>
                    <img src={galleryPhotoUrl(photo.storage_path)} alt={photo.alt_text} />
                    <div className="admin-photo-info">
                      <strong>{photo.caption}</strong>
                      <span>{photo.alt_text}</span>
                      {photo.destination_id && photo.highlight && (
                        <span>
                          Also shown in{" "}
                          {destinations.find((item) => item.id === photo.destination_id)?.n ??
                            photo.destination_id}
                          : {photo.highlight}
                        </span>
                      )}
                    </div>
                    <div className="admin-photo-actions">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Move ${photo.caption} up`}
                        title="Move up"
                        disabled={busy || index === 0}
                        onClick={() => void movePhoto(index, -1)}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Move ${photo.caption} down`}
                        title="Move down"
                        disabled={busy || index === photos.length - 1}
                        onClick={() => void movePhoto(index, 1)}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Remove ${photo.caption}`}
                        title="Delete photo"
                        disabled={busy}
                        onClick={() => void removePhoto(photo)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              </>}
            </>
          )}
          {!signedIn && error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
