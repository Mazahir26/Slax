/**
 * A quiet, full-bleed texture for large surfaces. The pattern is drawn with
 * `currentColor` so it follows the theme, and drifts a few pixels on a very
 * slow loop. Decorative only: hidden from assistive tech and inert.
 */
export function PatternBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-foreground"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="site-pattern absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] opacity-[0.08] motion-reduce:animate-none dark:opacity-[0.05]"
      >
        <defs>
          <pattern
            id="slax-site-pattern"
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="1" fill="currentColor" />
            <path
              d="M26 24h8"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#slax-site-pattern)" />
      </svg>
    </div>
  );
}

export default PatternBackground;
