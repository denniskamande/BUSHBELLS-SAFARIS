import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Star } from "lucide-react";
import { PageHeading } from "@/components/safari-site";

const safariBookingsReviews = "https://www.safaribookings.com/p5942";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Guest Reviews | Bushbells Safaris" },
      {
        name: "description",
        content: "Read guest feedback for Bushbells Safaris, sourced from SafariBookings.",
      },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <main>
      <PageHeading
        title="Guest reviews"
        description="Hear from travelers who have explored Kenya with Bushbells Safaris."
      />
      <section className="section">
        <div className="wrap reviews-layout">
          <div className="reviews-summary">
            <span className="eyebrow">TRAVELER RATING</span>
            <div className="reviews-score">
              <strong>5.0</strong>
              <span> / 5</span>
            </div>
            <div className="reviews-stars" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} fill="currentColor" aria-hidden="true" />
              ))}
            </div>
            <p>Guest reviews on SafariBookings</p>
            <a href={safariBookingsReviews} target="_blank" rel="noreferrer">
              See the latest rating on SafariBookings <ExternalLink aria-hidden="true" />
            </a>
          </div>

          <article className="review-card">
            <div className="review-card-top">
              <div className="reviews-stars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} fill="currentColor" aria-hidden="true" />
                ))}
              </div>
              <span>SafariBookings review</span>
            </div>
            <h2>
              “Very helpful company, and the driver was excellent. He created a wonderful day for
              us”
            </h2>
            <p className="review-meta">Kristoffer · Denmark · August 17, 2026</p>
            <p className="review-attribution">
              Review shown with attribution. Read the full review and all guest feedback on the
              original SafariBookings profile.
            </p>
            <a
              className="review-source-link"
              href={safariBookingsReviews}
              target="_blank"
              rel="noreferrer"
            >
              Read all reviews on SafariBookings <ExternalLink aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
