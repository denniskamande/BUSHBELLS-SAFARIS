import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeading, EnquiryForm } from "@/components/safari-site";
import { Button } from "@/components/ui/button";
import { packages, pageHead, packageImage, destinations } from "@/lib/safaris";
export const Route = createFileRoute("/packages/$slug")({
  loader: ({ params }) => {
    const p = packages.find((p) => p.id === params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) =>
    pageHead(loaderData?.n ?? "Safari package", loaderData?.t ?? "A personalised Kenya safari."),
  component: Page,
});
function Page() {
  const p = Route.useLoaderData();
  return (
    <main>
      <PageHeading title={p.n} description={p.t} />
      <section className="section">
        <div className="wrap two-columns">
          <div className="prose">
            <img
              className="detail-photo"
              src={packageImage(p.id)}
              alt={p.n}
              width={1024}
              height={768}
            />
            <div className="facts">
              <div>
                <small>Duration</small>
                {p.duration}
                {p.days > 1 ? ` · ${p.days - 1} nights` : ""}
              </div>
              <div>
                <small>Estimated price per person (USD)</small>{p.priceEstimate}
              </div>
              <div>
                <small>Departure</small>Nairobi
              </div>
            </div>
            <p className="pricing-note">Indicative SafariBookings prices for two travelers. Rates vary with season, availability, accommodation and final inclusions; request a current quote.</p>
            <h2>About this safari</h2>
            <p>{p.t}</p>
            <h3>Destinations on this journey</h3>
            <ol className="journey-wave" aria-label="Destinations in route order">
              {p.ds.map((id, index) => {
                const place = destinations.find((destination) => destination.id === id);
                return (
                  <li
                    key={id}
                    className={index % 2 ? "journey-stop journey-stop-low" : "journey-stop"}
                  >
                    <span className="journey-stop-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{place?.n ?? id}</strong>
                  </li>
                );
              })}
            </ol>
            <Button asChild variant="outline">
              <a href={p.source} target="_blank" rel="noreferrer">
                View original SafariBookings listing <ArrowRight />
              </a>
            </Button>
          </div>
          <EnquiryForm initialPackage={p.n} compact />
        </div>
      </section>
    </main>
  );
}
