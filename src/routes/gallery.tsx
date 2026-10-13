import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, CTA } from "@/components/safari-site";
import { Gallery } from "@/components/gallery";
import { pageHead } from "@/lib/safaris";
export const Route = createFileRoute("/gallery")({
  head: () =>
    pageHead(
      "Safari Gallery",
      "Wildlife photos and safari videos from Bushbells Safaris journeys across East Africa.",
    ),
  component: () => (
    <main>
      <PageHeading
        title="A glimpse of the wild"
        description="Wildlife photos and safari videos from East Africa, with new media added by the Bushbells team."
      />
      <section className="section">
        <div className="wrap">
          <Gallery />
        </div>
      </section>
      <CTA />
    </main>
  ),
});
