import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeading, EnquiryForm } from "@/components/safari-site";
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
            <h3>Day-by-day safari itinerary</h3>
            <div className="itinerary">
              {p.it.map(([title, description], index) => (
                <article className="day" key={`${p.id}-day-${index + 1}`}>
                  <span className="day-number" aria-hidden="true">
                    {p.days < 1 ? "½" : String(index + 1).padStart(2, "0")}
                  </span>
                  <h4 className="itinerary-day-title">
                    {p.days < 1 ? "Half-day" : `Day ${index + 1}`} · {title}
                  </h4>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <p className="itinerary-note">
              Daily plans are a guide. Timing and activities may vary with travel dates and
              availability; your final itinerary will be confirmed with your quote.
            </p>
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
          </div>
          <EnquiryForm initialPackage={p.n} compact />
        </div>
      </section>
    </main>
  );
}
