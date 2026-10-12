import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeading, PackageCard, CTA } from "@/components/safari-site";
import { pageHead } from "@/lib/safaris";
import { useSafariPackages } from "@/lib/use-safari-packages";
export const Route = createFileRoute("/packages/")({
  head: () =>
    pageHead(
      "Safari Packages",
      "Explore Bushbells Safaris tours, with itineraries for wildlife, landscapes and coastal escapes.",
    ),
  component: Page,
});
function Page() {
  const { safaris } = useSafariPackages();
  const [duration, setDuration] = useState("All safaris");
  const [query, setQuery] = useState("");
  const durations = ["All safaris", ...Array.from(new Set(safaris.map((p) => p.duration)))];
  const filtered = useMemo(
    () =>
      safaris.filter(
        (p) =>
          (duration === "All safaris" || p.duration === duration) &&
          `${p.n} ${p.t} ${p.ds.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [duration, query, safaris],
  );
  return (
    <main>
      <PageHeading
        title="Safari packages"
        description="Browse Bushbells Safaris journeys, from half-day Nairobi wildlife escapes to multi-day adventures across Kenya. Ask us for a quote tailored to your dates and group."
      />
      <section className="section">
        <div className="wrap">
          <div className="package-filters">
            <div className="country-tabs" role="group" aria-label="Filter safaris by duration">
              {durations.map((d) => (
                <Button
                  key={d}
                  variant={duration === d ? "forest" : "outline"}
                  aria-pressed={duration === d}
                  onClick={() => setDuration(d)}
                >
                  {d}
                </Button>
              ))}
            </div>
            <label className="search-field">
              <span>Search itineraries</span>
              <input
                type="search"
                aria-label="Search safari itineraries"
                placeholder="Try Mara or Amboseli"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <p className="results-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "journey" : "journeys"} to explore
          </p>
          {filtered.length ? (
            <div className="package-grid">
              {filtered.map((p) => (
                <PackageCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No journeys match those filters</h2>
              <p>Try another search or clear your duration filter.</p>
              <Button
                variant="forest"
                onClick={() => {
                  setDuration("All safaris");
                  setQuery("");
                }}
              >
                Show all safaris
              </Button>
            </div>
          )}
        </div>
      </section>
      <CTA />
    </main>
  );
}
