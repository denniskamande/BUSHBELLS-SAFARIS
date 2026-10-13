import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, CTA } from "@/components/safari-site";
import { faq, pageHead } from "@/lib/safaris";
export const Route = createFileRoute("/about")({
  head: () =>
    pageHead(
      "About Us",
      "Meet your Kenya-based safari team, with local expertise and 24/7 client support.",
    ),
  component: Page,
});
function Page() {
  return (
    <main>
      <PageHeading
        title="Local roots. Extraordinary journeys."
        description="Your Kenya-based team, ready to bring your safari dreams to life."
      />
      <section className="section">
        <div className="wrap two-columns">
          <div className="prose">
            <h2>Our story</h2>
            <p>
              Founded in 2023, Bushbells Safaris is a Kenya-based tour operator. We are always
              looking for ways to improve, so every client gets the best experience when planning a
              safari with us.
            </p>
            <p>
              With 24/7 support, we streamline the whole planning phase to lift the weight from your
              shoulders.
            </p>
            <h3>Responsible tourism</h3>
            <p>
              We minimise our impact on the environment, support the communities we visit, and offer
              authentic experiences that respect people and places.
            </p>
            <p>
              We are acknowledged by the Tourism Regulatory Authority and listed on SafariBookings.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl mb-4">Your questions, answered.</h2>
            {faq.map((f) => (
              <details className="faq-item" key={f[0]}>
                <summary>{f[0]}</summary>
                <p>{f[1]}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </main>
  );
}
