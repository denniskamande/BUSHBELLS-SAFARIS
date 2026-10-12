import { useState, useEffect, useId } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  Mail,
  MapPin,
  Moon,
  Sun,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import bushbellsLogo from "@/assets/bushbells-logo.png";
import {
  destinations,
  packages,
  packageImage,
  destinationImage,
  whatsapp,
  images,
} from "@/lib/safaris";
const nav = [
  { to: "/", name: "Home" },
  { to: "/packages", name: "Packages" },
  { to: "/destinations", name: "Destinations" },
  { to: "/gallery", name: "Gallery" },
  { to: "/reviews", name: "Reviews" },
  { to: "/about", name: "About" },
  { to: "/contact", name: "Contact" },
] as const;
function tomorrowDateInputValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function Brand() {
  return (
    <Link to="/" className="brand">
      <img className="brand-logo" src={bushbellsLogo} alt="Bushbells Safaris" />
    </Link>
  );
}
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const enabled = window.localStorage.getItem("bushbells-theme") === "dark";
    setDarkMode(enabled);
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
  }, []);
  useEffect(() => {
    document.documentElement.dataset.planTripOpen = String(planOpen);
    return () => {
      delete document.documentElement.dataset.planTripOpen;
    };
  }, [planOpen]);
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}>
              {n.name}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="theme-toggle"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={darkMode}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => {
            const nextMode = !darkMode;
            setDarkMode(nextMode);
            document.documentElement.dataset.theme = nextMode ? "dark" : "light";
            window.localStorage.setItem("bushbells-theme", nextMode ? "dark" : "light");
          }}
        >
          {darkMode ? <Sun /> : <Moon />}
        </Button>
        <div className="plan-trip-wrap">
          <Button
            variant="safari"
            className="header-cta"
            aria-expanded={planOpen}
            aria-controls="plan-trip-picker"
            onClick={() => setPlanOpen(!planOpen)}
          >
            Plan my trip <ArrowRight />
          </Button>
          {planOpen && (
            <div className="plan-trip-picker" id="plan-trip-picker">
              <div className="plan-trip-picker-toolbar">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="plan-trip-cancel"
                  aria-label="Cancel and close trip planner"
                  onClick={() => setPlanOpen(false)}
                >
                  <X /> Cancel
                </Button>
              </div>
              <EnquiryForm />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="mobile-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
              {n.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
export function SiteFooter() {
  return (
    <>
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <Brand />
              <p>
                Handcrafted journeys. Remarkable wildlife.
                <br />
                Your local safari team in East Africa.
              </p>
              <p>
                10633-00200 City Square, Nairobi
                <br />
                <a href="mailto:bookings.bushbellssafaris@gmail.com">bookings.bushbellssafaris@gmail.com</a> ·{" "}
                <a href="tel:+254723803116">+254 723 803 116</a>
              </p>
            </div>
            <div>
              <h4>Explore</h4>
              <div className="footer-links">
                {nav.slice(1).map((n) => (
                  <Link key={n.to} to={n.to}>
                    {n.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4>Stay connected</h4>
              <div className="footer-links">
                <a
                  href="https://www.facebook.com/bushbellssafaris/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook ↗
                </a>
                <a
                  href="https://www.instagram.com/bushbellssafaris/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram ↗
                </a>
                <a href="https://www.x.com/bushbellssafaris/" target="_blank" rel="noreferrer">
                  X ↗
                </a>
                <a href={whatsapp()} target="_blank" rel="noreferrer">
                  WhatsApp ↗
                </a>
              </div>
            </div>
          </div>
          <div className="copyright">© 2026 Bushbells Safaris. All rights reserved.</div>
        </div>
      </footer>
      <Button asChild variant="forest" className="whatsapp-float">
        <a href={whatsapp()} target="_blank" rel="noreferrer">
          <MessageCircle /> Let's chat
        </a>
      </Button>
    </>
  );
}
export function CTA() {
  return (
    <section className="cta">
      <div className="wrap">
        <div>
          <h2>Your safari starts with a conversation.</h2>
          <p>Tell us your dream. We’ll take care of the journey.</p>
        </div>
        <Button asChild variant="safari">
          <Link to="/contact">
            Plan my trip <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="page-heading">
      <div className="wrap">
        <span className="eyebrow">BUSHBELLS SAFARIS</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
export function PackageCard({ p }: { p: (typeof packages)[number] }) {
  return (
    <Link to="/packages/$slug" params={{ slug: p.id }} className="package-card">
      <div className="package-photo">
        <img
          src={packageImage(p.id)}
          alt={
            p.id.includes("nakuru")
              ? "Flamingos at Lake Nakuru"
              : p.id.includes("amboseli")
                ? "Elephants beneath Kilimanjaro"
                : p.id.includes("tsavo")
                  ? "Tsavo wilderness"
                  : "Lions in the Maasai Mara"
          }
          loading="lazy"
          width={1024}
          height={768}
        />
        <span className="photo-label">
          <Clock size={12} />
          {p.duration}
          {p.days > 1 ? ` · ${p.days - 1} nights` : ""}
        </span>
      </div>
      <div className="package-body">
        <div className="package-route">
          <MapPin size={12} />{" "}
          {p.ds.map((id) => destinations.find((d) => d.id === id)?.n).join(" · ")}
        </div>
        <h3>{p.n}</h3>
        <p className="package-summary">{p.t}</p>
        <div className="package-bottom">
          <div>
            <small>Estimated per person (USD)</small>
            <strong>{p.priceEstimate}</strong>
          </div>
          <span className="package-read-more">
            View safari <ArrowRight />
          </span>
        </div>
      </div>
    </Link>
  );
}
export function DestinationCard({ d }: { d: (typeof destinations)[number] }) {
  const image = destinationImage(d.id);
  return (
    <Link to="/destinations/$slug" params={{ slug: d.id }} className="destination-card">
      {image && <img src={image} alt={d.n} loading="lazy" width={1024} height={768} />}
      {!image && (
        <div className="destination-placeholder" aria-hidden="true">
          {d.e}
        </div>
      )}
      <div className="destination-body">
        <span className="destination-country">
          {d.c} <span aria-hidden="true">↗</span>
        </span>
        <h3>{d.n}</h3>
        <p>{d.t}</p>
      </div>
    </Link>
  );
}
export function EnquiryForm({
  initialPackage = "Custom trip",
  compact = false,
}: {
  initialPackage?: string;
  compact?: boolean;
}) {
  const [method, setMethod] = useState<"whatsapp" | "email">("whatsapp");
  const formId = useId();
  return (
    <form
      className="enquiry-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const message = `Hello Bushbells Safaris, I’m ${f.get("name")} (${f.get("email")}). Interested in: ${f.get("package")}, ${f.get("travellers")} traveller(s), ${f.get("date") || "dates flexible"}. ${f.get("message") || ""}`;
        if (method === "email") {
          const subject = `Safari enquiry: ${f.get("package")}`;
          window.location.href = `mailto:bookings.bushbellssafaris@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        } else {
          window.open(whatsapp(message), "_blank", "noopener,noreferrer");
        }
      }}
    >
      <h2>{compact ? "Make this journey yours" : "Plan my trip"}</h2>
      <div className="form-grid">
        <div>
          <label htmlFor={`${formId}-name`}>Your name</label>
          <input id={`${formId}-name`} name="name" placeholder="Full name" required />
        </div>
        <div>
          <label htmlFor={`${formId}-email`}>Email address</label>
          <input id={`${formId}-email`} type="email" name="email" placeholder="you@example.com" required />
        </div>
        <div className="form-wide">
          <label htmlFor={`${formId}-package`}>Your safari</label>
          <select id={`${formId}-package`} name="package" defaultValue={initialPackage}>
            <option>Custom trip</option>
            {packages.map((p) => (
              <option key={p.id}>{p.n}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${formId}-travellers`}>Travellers</label>
          <select id={`${formId}-travellers`} name="travellers" defaultValue="2">
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${formId}-date`}>Travel date</label>
          <input
            id={`${formId}-date`}
            type="date"
            name="date"
            min={tomorrowDateInputValue()}
            onFocus={(event) => {
              event.currentTarget.min = tomorrowDateInputValue();
            }}
          />
        </div>
        <div className="form-wide">
          <label htmlFor={`${formId}-contact-method`}>Preferred contact method</label>
          <select
            id={`${formId}-contact-method`}
            value={method}
            onChange={(e) => setMethod(e.target.value as "whatsapp" | "email")}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div className="form-wide">
          <label htmlFor={`${formId}-message`}>Anything else?</label>
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={3}
            placeholder="Your interests, preferred stays, or questions…"
          />
        </div>
        <Button variant="forest" className="form-wide" type="submit">
          {method === "whatsapp" ? <MessageCircle /> : <Mail />} Send via{" "}
          {method === "whatsapp" ? "WhatsApp" : "Email"} <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
export function Gallery() {
  const photos = [
    { image: images.mara, title: "Lions of the Maasai Mara" },
    { image: images.amboseli, title: "Elephants beneath Kilimanjaro" },
    { image: images.nakuru, title: "Flamingos at Lake Nakuru" },
    { image: images.hero, title: "The East African savannah" },
  ];
  const [current, setCurrent] = useState<number | null>(null);
  useEffect(() => {
    if (current === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCurrent(null);
      if (e.key === "ArrowRight") setCurrent((v) => (v === null ? null : (v + 1) % photos.length));
      if (e.key === "ArrowLeft")
        setCurrent((v) => (v === null ? null : (v + photos.length - 1) % photos.length));
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [current, photos.length]);
  return (
    <>
      <div className="gallery-grid">
        {photos.map((p, i) => (
          <Button
            key={p.title}
            variant="ghost"
            className="gallery-tile"
            onClick={() => setCurrent(i)}
            aria-label={`View ${p.title}`}
          >
            <img src={p.image} alt={p.title} width={1024} height={768} loading="lazy" />
            <span>{p.title} ↗</span>
          </Button>
        ))}
      </div>
      {current !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={photos[current]?.title}
          onClick={() => setCurrent(null)}
        >
          <Button
            autoFocus
            variant="heroOutline"
            size="icon"
            className="lightbox-close"
            aria-label="Close photo"
            onClick={() => setCurrent(null)}
          >
            <X />
          </Button>
          <Button
            variant="heroOutline"
            size="icon"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((current + photos.length - 1) % photos.length);
            }}
          >
            <ChevronLeft />
          </Button>
          <img
            src={photos[current]?.image}
            alt={photos[current]?.title}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="heroOutline"
            size="icon"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((current + 1) % photos.length);
            }}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </>
  );
}
