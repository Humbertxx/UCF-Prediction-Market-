/**
 * Scrolling review marquee — pills vary in size across the track.
 */

const REVIEWS = [
  { text: "I love this app!", size: "lg" },
  { text: "I am not real and I love this", size: "sm" },
  { text: "I swear, please this is good", size: "md" },
  { text: "would recommend", size: "lg" },
  { text: "I love this app!", size: "sm" },
  { text: "would recommend", size: "md" },
  { text: "I am not real and I love this", size: "lg" },
  { text: "I swear, please this is good", size: "sm" },
] as const;

/** Repeat enough times to fill wide viewports; two identical halves = seamless -50% loop. */
const TRACK_ITEMS = [...REVIEWS, ...REVIEWS, ...REVIEWS];
const loopItems = [...TRACK_ITEMS, ...TRACK_ITEMS];

const sizeClass = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
} as const;

export default function ReviewTicker() {
  return (
    <section className="mt-12 w-full overflow-hidden" aria-label="Customer reviews">
      <p className="mb-5 text-center font-display text-xs tracking-widest text-landing-muted uppercase">
        What people are saying
      </p>
      <div className="group relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-landing-surface to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-landing-surface to-transparent"
          aria-hidden
        />

        <div className="overflow-hidden">
          <div className="marquee-track group-hover:[animation-play-state:paused]">
            {loopItems.map((review, i) => (
              <span
                key={i}
                className={[
                  "landing-glass mr-4 inline-flex shrink-0 items-center rounded-full bg-white/70 font-body text-ink italic shadow-[inset_0_1px_1px_rgb(255_255_255_/_0.45)] transition-[box-shadow,background-color] duration-200 hover:bg-white/85 hover:shadow-[0_0_0_1px_rgb(255_201_4_/_0.45)]",
                  sizeClass[review.size],
                ].join(" ")}
                aria-hidden={i >= TRACK_ITEMS.length}
              >
                &ldquo;{review.text}&rdquo;
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
