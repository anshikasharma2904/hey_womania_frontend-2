# Storefront performance changes

The audit screenshots describe the deployed site. These changes must be deployed before a new production Lighthouse run can measure their effect.

## Changes

- Removed the external Google Fonts stylesheet and the 1.1 MB Material Symbols font dependency. Icons now render as SVGs without a font request.
- Enabled Next.js `experimental.inlineCss` so the first response contains the styles instead of waiting for separate CSS requests. This is experimental and increases HTML size; styles cannot be cached separately on initial document loads. Recheck after Next.js upgrades. Reference: https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss
- Replaced the homepage GSAP coverflow animations with CSS transforms and opacity transitions. Its initial positions are server rendered, and reduced-motion preferences disable transitions.
- Added media-specific homepage hero poster preloads. Only the applicable mobile or desktop video mounts, after the initial render; offscreen playback pauses.
- Deferred analytics library downloads until after load, retaining the initial event queues. Gift modal code loads upon its opening event and preserves the event's product name. The fixed support widget loads after startup.
- Added responsive product image sizes, small color swatches and order thumbnails, and one shared mobile/desktop gallery image. Images no longer wait for hydration to become visible.
- Let Next.js manage immutable caching of hashed build assets; added the existing static-media caching policy to MP4, WebM and AVIF files.

## Verification and remaining limits

The production build and TypeScript check pass. The generated homepage contains inline styles, zero stylesheet links, no external Google Fonts stylesheet, and no GSAP in its initial script files.

The backend at localhost:5000 was unavailable during local checks. Live catalog data, authenticated flows and checkout require verification against a running backend. Browser smoke checks are not a Lighthouse score or a production speed benchmark.

Third-party cache headers and the compatibility code inside third-party scripts cannot be changed by this frontend. Deferring them reduces startup contention, but does not remove their eventual downloads. Shared Tailwind rules and framework JavaScript can still be reported as unused on an individual page. Do not delete required styles or browser polyfills merely to clear those audits.

The hero now uses versioned, H.264 fast-start videos in `public/media`, with no audio track:

| Hero | Original | Web version | Reduction |
| --- | ---: | ---: | ---: |
| Mobile | 68,136,659 bytes | 2,390,673 bytes | 96.5% |
| Desktop | 37,649,061 bytes | 2,980,932 bytes | 92.1% |

Originals are preserved. Regenerate with `python3 scripts/optimize-hero-media.py --ffmpeg /path/to/ffmpeg`. Custom media configured in the admin settings is preserved and may need its own compression. The hero uses its still poster for reduced-motion, data-saver, and 2G connections.

Carousels pause outside the viewport, in hidden tabs, or under reduced motion. Settings are fetched once on the server and cached for 60 seconds, removing the two browser settings requests. Public product data and customer lookup now start concurrently; recommendations stream separately inside Suspense so they do not delay the product gallery. Price and stock fetching remain uncached.

After deployment, rerun mobile and desktop Lighthouse against the same URL and throttling settings. Inspect expanded request-level findings for cache lifetime, legacy JavaScript, and unused code before making further changes. Check navigation, category filters, color selection, mobile gallery swipes, add-to-cart, the gift popup and checkout with real product data.
