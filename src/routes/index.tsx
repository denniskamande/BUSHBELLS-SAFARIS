import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Headphones,
  Compass,
  Users,
  Check,
  Car,
  Sailboat,
  Wind,
  Plane,
  Footprints,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageCard, DestinationCard, CTA } from "@/components/safari-site";
import { packages, destinations, images, pageHead, experiences } from "@/lib/safaris";
import gameDrivePhoto from "@/assets/experiences/game-drive.jpg";
import boatRidePhoto from "@/assets/experiences/boat-ride.jpg";
import balloonPhoto from "@/assets/experiences/hot-air-balloon.jpg";
import flyingSafariPhoto from "@/assets/experiences/flying-safari.jpg";
import culturePhoto from "@/assets/experiences/maasai-culture.jpg";
import hikingPhoto from "@/assets/experiences/mount-kenya-hike.jpg";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Your East African Safari",
      "Handcrafted safaris across Kenya, Uganda and Tanzania. Explore our signature journeys with a Nairobi-based team and 24/7 support.",
    ),
  component: Index,
});
function Index() {
  const [country, setCountry] = useState("Kenya");
  const icons = [Car, Sailboat, Wind, Plane, Handshake, Footprints];
  const experiencePhotos = [
    {
      image: gameDrivePhoto,
      alt: "Lions resting near a safari vehicle in the Maasai Mara",
    },
    {
      image: boatRidePhoto,
      alt: "A small boat carrying passengers across East African waters",
    },
    {
      image: balloonPhoto,
      alt: "Hot-air balloons rising over the Maasai Mara at sunrise",
    },
    {
      image: flyingSafariPhoto,
      alt: "A small safari aircraft waiting at an airstrip in the Maasai Mara",
    },
    {
      image: culturePhoto,
      alt: "Maasai people walking through the landscape beneath Kilimanjaro",
    },
    {
      image: hikingPhoto,
      alt: "The high-altitude peaks and alpine vegetation of Mount Kenya",
    },
  ];
  const experienceSettings = [
    "ON THE PLAINS",
    "ON THE WATER",
    "AT SUNRISE",
    "BETWEEN PARKS",
    "LOCAL CONNECTIONS",
    "ON FOOT",
  ];
  return (
    <main>
      <section className="hero">
        <img
          className="hero-image"
          src={images.hero}
          alt="Elephants crossing the East African savannah"
          width={1920}
          height={1024}
          fetchPriority="high"
        />
        <div className="wrap">
          <span className="eyebrow">
            <span aria-hidden="true">—</span> YOUR LOCAL CONNECTION TO EAST AFRICA
          </span>
          <h1>Bushbells Safaris</h1>
          <div className="hero-subtitle">Your next great adventure awaits.</div>
          <p className="hero-copy">
            Wild places. Unforgettable encounters. Handcrafted safaris across Kenya, Uganda and
            Tanzania — made just for you.
          </p>
          <div className="hero-actions">
            <Button asChild variant="safari">
              <Link to="/packages">
                Explore our safaris <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="heroOutline">
              <Link to="/contact">Plan my trip</Link>
            </Button>
          </div>
          <div className="hero-note">
            <Check size={15} /> Local expertise <span>·</span> Personalised journeys <span>·</span>{" "}
            24/7 support
          </div>
        </div>
        <span className="hero-location">
          <MapPin size={14} /> The wild heart of East Africa
        </span>
      </section>
      <section className="trust-band" aria-label="Why travel with Bushbells">
        <div className="wrap trust-grid">
          {[
            { icon: Compass, title: "Locally rooted", copy: "Based in Nairobi, Kenya" },
            { icon: Users, title: "Made for you", copy: "Private, personalised safaris" },
            { icon: Headphones, title: "Here, around the clock", copy: "24/7 client support" },
            {
              icon: ShieldCheck,
              title: "Travel with confidence",
              copy: "TRA-acknowledged operator",
            },
          ].map((t) => (
            <div className="trust-item" key={t.title}>
              <t.icon strokeWidth={1.5} />
              <div>
                <strong>{t.title}</strong>
                <span>{t.copy}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE JOURNEY IS YOURS</span>
              <h2>A little inspiration. A great adventure.</h2>
              <p>Our most-loved safaris, ready to become your own.</p>
            </div>
            <Button asChild variant="link">
              <Link to="/packages">
                View all safaris <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="package-grid">
            {packages.slice(0, 3).map((p) => (
              <PackageCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="section section-muted">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THREE COUNTRIES. ENDLESS POSSIBILITIES.</span>
              <h2>Where will your story take you?</h2>
              <p>From iconic savannahs to misty mountains, find your wild.</p>
            </div>
            <Button asChild variant="link">
              <Link to="/destinations">
                All destinations <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="country-tabs" role="group" aria-label="Destination country">
            {["Kenya", "Uganda", "Tanzania"].map((c) => (
              <Button
                key={c}
                variant={country === c ? "forest" : "outline"}
                onClick={() => setCountry(c)}
                aria-pressed={country === c}
              >
                {c}
              </Button>
            ))}
          </div>
          <div className="destination-grid">
            {destinations
              .filter((d) => d.c === country)
              .slice(0, 4)
              .map((d) => (
                <DestinationCard key={d.id} d={d} />
              ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPERIENCES WE OFFER</span>
              <h2>More than a game drive.</h2>
              <p>
                Find new ways to experience East Africa, from quiet lake waters to wide-open skies.
              </p>
            </div>
          </div>
          <div className="experience-grid">
            {experiences.map((x, i) => {
              const Icon = icons[i] ?? Compass;
              const photo = experiencePhotos[i] ?? experiencePhotos[0];
              return (
                <article className="experience-card" key={x[0]}>
                  <div className="experience-visual">
                    <img
                      src={photo.image}
                      alt={photo.alt}
                      width={1024}
                      height={768}
                      loading="lazy"
                    />
                    <span className="experience-icon" aria-hidden="true">
                      <Icon strokeWidth={1.6} />
                    </span>
                    <span className="experience-label">{experienceSettings[i]}</span>
                  </div>
                  <div className="experience-body">
                    <h3>{x[0]}</h3>
                    <p>{x[2]}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <CTA />
    </main>
  );
}
