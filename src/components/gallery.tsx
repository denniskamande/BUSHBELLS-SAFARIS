import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  galleryPhotoUrl,
  getSupabaseClient,
  listGalleryPhotos,
  type GalleryPhoto,
} from "@/lib/gallery-service";

type GalleryView = { mediaType: "image" | "video"; src: string; title: string; alt: string };

export function Gallery() {
  const [uploaded, setUploaded] = useState<GalleryPhoto[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    void listGalleryPhotos()
      .then(({ data, error }) => {
        if (active && !error && data) setUploaded(data as GalleryPhoto[]);
      })
      .catch(() => {
        // Keep the gallery empty if Supabase cannot be reached.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const photos: GalleryView[] = uploaded.map((photo) => ({
    mediaType: photo.media_type ?? "image",
    src: galleryPhotoUrl(photo.storage_path),
    title: photo.caption,
    alt: photo.alt_text,
  }));
  const photoCount = photos.length;

  useEffect(() => {
    if (current === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCurrent(null);
      if (event.key === "ArrowRight")
        setCurrent((index) => (index === null ? null : (index + 1) % photoCount));
      if (event.key === "ArrowLeft")
        setCurrent((index) => (index === null ? null : (index + photoCount - 1) % photoCount));
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [current, photoCount]);

  return (
    <>
      {loading && (
        <p className="gallery-status" aria-live="polite">
          Loading gallery…
        </p>
      )}
      <div className="gallery-grid">
        {!loading && photos.length === 0 && (
          <p className="gallery-status" role="status">
            New safari photos and videos are coming soon.
          </p>
        )}
        {photos.map((photo, index) => (
          <Button
            key={`${photo.src}-${photo.title}`}
            variant="ghost"
            className="gallery-tile"
            onClick={() => setCurrent(index)}
            aria-label={`View ${photo.mediaType === "video" ? "video" : "photo"}: ${photo.title}`}
          >
            {photo.mediaType === "video" ? (
              <>
                <video
                  src={photo.src}
                  aria-label={photo.alt || photo.title}
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="gallery-video-badge" aria-hidden="true">
                  ▶ Video
                </span>
              </>
            ) : (
              <img src={photo.src} alt={photo.alt} width={1024} height={768} loading="lazy" />
            )}
            <span>{photo.title} ↗</span>
          </Button>
        ))}
      </div>
      {current !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={photos[current]?.title}
          onClick={() => setCurrent(null)}
        >
          <Button
            autoFocus
            variant="heroOutline"
            size="icon"
            className="lightbox-close"
            aria-label="Close media"
            onClick={() => setCurrent(null)}
          >
            <X />
          </Button>
          <Button
            variant="heroOutline"
            size="icon"
            aria-label="Previous item"
            onClick={(event) => {
              event.stopPropagation();
              setCurrent((current + photoCount - 1) % photoCount);
            }}
          >
            <ChevronLeft />
          </Button>
          <figure className="lightbox-figure">
            {photos[current]?.mediaType === "video" ? (
              <video
                src={photos[current]?.src}
                aria-label={photos[current]?.alt}
                controls
                autoPlay
                playsInline
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <img
                src={photos[current]?.src}
                alt={photos[current]?.alt}
                onClick={(event) => event.stopPropagation()}
              />
            )}
            <figcaption>{photos[current]?.title}</figcaption>
          </figure>
          <Button
            variant="heroOutline"
            size="icon"
            aria-label="Next item"
            onClick={(event) => {
              event.stopPropagation();
              setCurrent((current + 1) % photoCount);
            }}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </>
  );
}
