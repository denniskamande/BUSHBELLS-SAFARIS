import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, CTA, PackageCard } from "@/components/safari-site";
import { destinations, packages, pageHead, destinationImage, whatsapp } from "@/lib/safaris";
import {
  galleryPhotoUrl,
  getSupabaseClient,
  listDestinationPhotos,
  type GalleryPhoto,
} from "@/lib/gallery-service";
import gameDrivePhoto from "@/assets/experiences/game-drive.jpg";
import boatRidePhoto from "@/assets/experiences/boat-ride.jpg";
import balloonPhoto from "@/assets/experiences/hot-air-balloon.jpg";
import flyingSafariPhoto from "@/assets/experiences/flying-safari.jpg";
import culturePhoto from "@/assets/experiences/maasai-culture.jpg";
import hikingPhoto from "@/assets/experiences/mount-kenya-hike.jpg";

function highlightPhoto(destinationId: string, highlight: string) {
  const text = highlight.toLowerCase();
  if (text.includes("balloon")) return balloonPhoto;
  if (text.includes("cultur") || text.includes("maasai") || text.includes("samburu") || text.includes("batwa")) return culturePhoto;
  if (text.includes("boat") || text.includes("dhow") || text.includes("hippo") || text.includes("snorkel")) return boatRidePhoto;
  if (text.includes("fly") || text.includes("flight")) return flyingSafariPhoto;
  if (text.includes("hik") || text.includes("trek") || text.includes("cycle") || text.includes("walk") || text.includes("climb") || text.includes("trail")) return hikingPhoto;
  if (text.includes("bird") || text.includes("flamingo")) return boatRidePhoto;
  if (text.includes("wildlife") || text.includes("game") || text.includes("cat") || text.includes("elephant") || text.includes("rhino") || text.includes("giraffe") || text.includes("zebra") || text.includes("lion") || text.includes("leopard") || text.includes("gorilla") || text.includes("chimp") || text.includes("buffalo") || text.includes("migration")) return gameDrivePhoto;
  return destinationImage(destinationId) ?? gameDrivePhoto;
}

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const d = destinations.find((d) => d.id === params.slug);
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) =>
    pageHead(loaderData?.n ?? "Destination", loaderData?.d ?? "Discover East Africa."),
  component: Page,
});
function Page() {
  const d = Route.useLoaderData();
  const [destinationPhotos, setDestinationPhotos] = useState<GalleryPhoto[]>([]);
  const image = destinationImage(d.id);
  const related = packages.filter((p) => p.ds.includes(d.id));

  useEffect(() => {
    if (!getSupabaseClient()) return;
    let active = true;
    void listDestinationPhotos(d.id).then(({ data }) => {
      if (active) setDestinationPhotos((data ?? []) as GalleryPhoto[]);
    });
    return () => {
      active = false;
    };
  }, [d.id]);

  return (
    <main>
      <PageHeading title={d.n} description={d.t} />
      <section className="section">
        <div className="wrap two-columns">
          <div className="prose">
            {image && (
              <img className="detail-photo" src={image} alt={d.n} width={1024} height={768} />
            )}
            <h2>About {d.n}</h2>
            <p>{d.d}</p>
            <div className="facts">
              <div>
                <small>Country</small>
                {d.c}
              </div>
              <div>
                <small>Best time to visit</small>
                {d.b}
              </div>
            </div>
            <h3>Highlights</h3>
            <ul className="destination-highlights">
              {d.l.map((highlight) => {
                const uploaded = destinationPhotos.filter((photo) => photo.highlight === highlight);
                return (
                  <li key={highlight}>
                    <div className="destination-highlight-images">
                      {uploaded.length ? (
                        uploaded.map((photo) => (
                          <img
                            key={photo.id}
                            src={galleryPhotoUrl(photo.storage_path)}
                            alt={photo.alt_text || photo.caption}
                            loading="lazy"
                          />
                        ))
                      ) : (
                        <img src={highlightPhoto(d.id, highlight)} alt="" loading="lazy" />
                      )}
                    </div>
                    <span>{highlight}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <aside className="enquiry-panel">
            <h3>Visit {d.n}</h3>
            <p className="text-muted-foreground mb-6">
              Tell us when and with whom, and we’ll shape the trip.
            </p>
            <Button asChild variant="forest" className="whatsapp-enquire">
              <a
                href={whatsapp(`Hello Bushbells Safaris, I’d like to visit ${d.n}.`)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle /> Enquire on WhatsApp
              </a>
            </Button>
          </aside>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section section-muted">
          <div className="wrap">
            <div className="section-heading">
              <h2>Journeys that visit {d.n}</h2>
            </div>
            <div className="package-grid">
              {related.map((p) => (
                <PackageCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CTA />
    </main>
  );
}
