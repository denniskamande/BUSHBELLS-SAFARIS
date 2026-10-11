import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeading, DestinationCard, CTA } from "@/components/safari-site";
import { destinations, pageHead } from "@/lib/safaris";
export const Route = createFileRoute("/destinations/")({
  head: () =>
    pageHead(
      "Destinations",
      `Discover ${destinations.length} destinations across Kenya, Uganda and Tanzania.`,
    ),
  component: Page,
});
function Page() {
  const [country, setCountry] = useState("All");
  const [query, setQuery] = useState("");
  const list = destinations.filter(
    (d) =>
      (country === "All" || d.c === country) && d.n.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main>
      <PageHeading
        title="Find your wild"
        description={`Explore ${destinations.length} destinations across Kenya, Uganda and Tanzania, including ${destinations.filter((d) => d.c === "Kenya").length} places in Kenya.`}
      />
      <section className="section">
        <div className="wrap">
          <div className="country-tabs" aria-label="Destination country">
            {["All", "Kenya", "Uganda", "Tanzania"].map((c) => (
              <Button
                key={c}
                variant={country === c ? "forest" : "outline"}
                aria-pressed={country === c}
                onClick={() => setCountry(c)}
              >
                {c}
              </Button>
            ))}
          </div>
          <input
            className="search-field"
            aria-label="Search destinations"
            placeholder="Search destinations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="destination-grid">
            {list.map((d) => (
              <DestinationCard key={d.id} d={d} />
            ))}
          </div>
          {!list.length && <p>No destinations found.</p>}
        </div>
      </section>
      <CTA />
    </main>
  );
}
