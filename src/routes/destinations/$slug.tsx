import { createFileRoute, notFound } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, CTA, PackageCard } from "@/components/safari-site";
import { destinations, packages, pageHead, destinationImage, whatsapp } from "@/lib/safaris";
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
  const image = destinationImage(d.id);
  const related = packages.filter((p) => p.ds.includes(d.id));
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
            <ul>
              {d.l.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <aside className="enquiry-panel">
            <h3>Visit {d.n}</h3>
            <p className="text-muted-foreground mb-6">
              Tell us when and with whom, and we’ll shape the trip.
            </p>
            <Button asChild variant="forest">
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
