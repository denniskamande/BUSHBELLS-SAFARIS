import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, EnquiryForm } from "@/components/safari-site";
import { KenyaRouteMap, type RouteStop } from "@/components/kenya-route-map";
import { packages, pageHead, packageImage } from "@/lib/safaris";
import { useSafariPackages } from "@/lib/use-safari-packages";
import { useSafariDestinations } from "@/lib/use-safari-destinations";
export const Route = createFileRoute("/packages/$slug")({
  loader: ({ params }) => {
    return packages.find((p) => p.id === params.slug);
  },
  head: ({ loaderData }) =>
    pageHead(loaderData?.n ?? "Safari package", loaderData?.t ?? "A personalised Kenya safari."),
  component: Page,
});
function Page() {
  const loadedPackage = Route.useLoaderData();
  const { safaris, loaded } = useSafariPackages();
  const destinations = useSafariDestinations();
  const slug = Route.useParams().slug;
  const p = safaris.find((safari) => safari.id === slug) ?? loadedPackage;
  if (!p) {
    return (
      <main>
        <PageHeading
          title={loaded ? "Safari not found" : "Loading safari…"}
          description={
            loaded
              ? "This safari may have been removed. Browse our other journeys."
              : "Loading safari details."
          }
        />
      </main>
    );
  }
  const destinationDays: Record<string, string[]> = {
    "maasai-mara": ["masai mara", "maasai mara", "mara"],
    "aberdare-ranges": ["aberdare"],
    "ol-pejeta": ["ol pejeta"],
    "hells-gate": ["hell's gate", "hells gate"],
    "lake-bogoria": ["bogoria"],
    "tsavo-east": ["tsavo east"],
    "tsavo-west": ["tsavo west"],
    naivasha: ["naivasha", "crescent island"],
    samburu: ["samburu"],
    nakuru: ["nakuru"],
    amboseli: ["amboseli"],
    nanyuki: ["nanyuki"],
    diani: ["diani"],
    nairobi: ["nairobi"],
  };
  const kenyaStops: RouteStop[] = p.ds.flatMap((id) => {
    const place = destinations.find((destination) => destination.id === id);
    if (place?.c !== "Kenya") return [];
    const aliases = destinationDays[id] ?? [place.n.toLowerCase()];
    const matchingDays = p.it.flatMap(([title, description], index) => {
      const dayText = `${title} ${description}`.toLowerCase();
      return aliases.some((alias) => dayText.includes(alias)) ? [index + 1] : [];
    });
    const dayGroups: [number, number][] = [];
    matchingDays.forEach((day) => {
      const previous = dayGroups.at(-1);
      if (previous && previous[1] + 1 === day) previous[1] = day;
      else dayGroups.push([day, day]);
    });
    const dayLabel = dayGroups.length
      ? dayGroups
          .map(([first, last]) => `Day ${first}${first === last ? "" : `–${last}`}`)
          .join(", ")
      : undefined;
    return [{ id: place.id, name: place.n, ...(dayLabel ? { dayLabel } : {}) }];
  });
  const finalDay = p.it.at(-1)?.join(" ").toLowerCase() ?? "";
  const routeEnd =
    p.days > 0.5 && /moi (international )?airport/.test(finalDay)
      ? { id: "mombasa", name: "Moi Airport" }
      : p.days > 0.5 && /nairobi/.test(finalDay)
        ? { id: "nairobi", name: "Nairobi (City)" }
        : undefined;

  return (
    <main>
      <PageHeading title={p.n} description={p.t} />
      <section className="section">
        <div className="wrap two-columns">
          <div className="prose">
            <img
              className="detail-photo"
              src={packageImage(p.id, p.imageUrl)}
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
                <small>Estimated price per person (USD)</small>
                {p.priceEstimate}
              </div>
              <div>
                <small>Departure</small>Nairobi
              </div>
            </div>
            <p className="pricing-note">
              Indicative SafariBookings prices for two travelers. Rates vary with season,
              availability, accommodation and final inclusions; request a current quote.
            </p>
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
            <KenyaRouteMap
              stops={kenyaStops}
              startAtNairobi={p.days > 0.5}
              {...(routeEnd ? { endAt: routeEnd } : {})}
            />
            {kenyaStops.length > 0 &&
              p.ds.some((id) => destinations.find((place) => place.id === id)?.c !== "Kenya") && (
                <p className="route-map-note">
                  This map shows the Kenya stops. Any Uganda or Tanzania destinations on this
                  itinerary are listed in the itinerary above.
                </p>
              )}
          </div>
          <EnquiryForm initialPackage={p.n} compact />
        </div>
      </section>
    </main>
  );
}
