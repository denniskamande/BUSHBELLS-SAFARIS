import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  galleryPhotoUrl,
  getSupabaseClient,
  listGalleryPhotos,
  type GalleryPhoto,
} from "@/lib/gallery-service";
import { images } from "@/lib/safaris";

type PhotoView = { image: string; title: string; alt: string };

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
        // The bundled gallery remains available if Supabase cannot be reached.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const photos: PhotoView[] = [
    ...uploaded.map((photo) => ({
      image: galleryPhotoUrl(photo.storage_path),
      title: photo.caption,
      alt: photo.alt_text,
    })),
    { image: images.mara, title: "Lions of the Maasai Mara", alt: "Lion in the Maasai Mara" },
    {
      image: images.amboseli,
      title: "Elephants beneath Kilimanjaro",
      alt: "Elephants beneath Mount Kilimanjaro",
    },
    { image: images.nakuru, title: "Flamingos at Lake Nakuru", alt: "Flamingos on Lake Nakuru" },
    { image: images.hero, title: "The East African savannah", alt: "East African savannah" },
  ];
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
        {photos.map((photo, index) => (
          <Button
            key={`${photo.image}-${photo.title}`}
            variant="ghost"
            className="gallery-tile"
            onClick={() => setCurrent(index)}
            aria-label={`View ${photo.title}`}
          >
            <img src={photo.image} alt={photo.alt} width={1024} height={768} loading="lazy" />
            <span>{photo.title} ↗</span>
          </Button>
        ))}
      </div>
      <p className="gallery-admin-link">
        <Link to="/admin">
          Manage gallery photos <ArrowRight size={14} />
        </Link>
      </p>
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
            aria-label="Close photo"
            onClick={() => setCurrent(null)}
          >
            <X />
          </Button>
          <Button
            variant="heroOutline"
            size="icon"
            aria-label="Previous photo"
            onClick={(event) => {
              event.stopPropagation();
              setCurrent((current + photoCount - 1) % photoCount);
            }}
          >
            <ChevronLeft />
          </Button>
          <figure className="lightbox-figure">
            <img
              src={photos[current]?.image}
              alt={photos[current]?.alt}
              onClick={(event) => event.stopPropagation()}
            />
            <figcaption>{photos[current]?.title}</figcaption>
          </figure>
          <Button
            variant="heroOutline"
            size="icon"
            aria-label="Next photo"
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
