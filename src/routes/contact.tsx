import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { PageHeading, EnquiryForm } from "@/components/safari-site";
import { pageHead, whatsapp } from "@/lib/safaris";
export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead(
      "Plan Your Trip",
      "Contact Bushbells Safaris in Nairobi and plan your personalised East African journey.",
    ),
  component: Page,
});
function Page() {
  return (
    <main>
      <PageHeading
        title="Let’s plan something unforgettable."
        description="Tell us where you dream of going. Our Nairobi team will take it from there."
      />
      <section className="section">
        <div className="wrap two-columns">
          <div className="prose">
            <h2>Good adventures start here.</h2>
            <p>
              Whether you have an itinerary in mind or just the spark of an idea, we’re happy to
              help.
            </p>
            <div className="contact-list">
              <div>
                <MapPin />
                10633-00200 City Square, Nairobi
              </div>
              <a href="mailto:info@bushbells.co.ke">
                <Mail />
                info@bushbells.co.ke
              </a>
              <a href="tel:+254723803116">
                <Phone />
                +254 723 803 116
              </a>
              <a href="tel:+254733418181">
                <Phone />
                +254 733 418 181
              </a>
              <a href={whatsapp()} target="_blank" rel="noreferrer">
                <MessageCircle />
                Chat with us on WhatsApp
              </a>
            </div>
            <h3>Here for you, 24/7.</h3>
            <p>Personal support before, during and after your safari.</p>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </main>
  );
}
