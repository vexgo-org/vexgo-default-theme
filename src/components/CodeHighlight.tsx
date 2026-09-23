import type { ReactElement } from "react";

/**
 * highlight.js assets for the public code blocks, loaded from the cdnjs CDN.
 *
 * The backend renders markdown through goldmark, which already emits the
 * standard `<pre><code class="language-<lang>">` markup, so highlighting is a
 * purely client-side concern: two CDN stylesheets color the tokens and
 * `highlight.min.js` calls `highlightAll()` once the document is parsed.
 *
 * The CDN themes are plain fixed-color stylesheets (no CSS variables), so both
 * are declared and the inline scripts in SiteLayout disable the one that does
 * not match the resolved `dark` class — see DocHead and ThemeToggle.
 *
 * Only the templates that render content which can contain code blocks use
 * these components (post, page, timeline, links); the list pages and 404 stay
 * untouched and load nothing extra.
 */

/** Pinned highlight.js version — never a range, so a CDN release cannot
 * silently change what the pages execute. */
const HLJS_VERSION = "11.12.0";

const HLJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${HLJS_VERSION}`;

const HLJS_JS_URL = `${HLJS_BASE}/highlight.min.js`;
const HLJS_LIGHT_CSS_URL = `${HLJS_BASE}/styles/github.min.css`;
const HLJS_DARK_CSS_URL = `${HLJS_BASE}/styles/github-dark.min.css`;

/**
 * Subresource Integrity digests of the three files above. Refresh them
 * whenever HLJS_VERSION changes:
 *
 *   curl -sL <url> | openssl dgst -sha512 -binary | openssl base64 -A
 *
 * A stale digest makes the browser block the asset (loud, and never the wrong
 * content), which is the point: it catches a changed build under a fixed
 * version instead of executing it.
 */
const HLJS_JS_INTEGRITY =
  "sha512-gzqHAlI1hVdzJ4wiQj/MkppDr6zgEdCoBsrXKRidcaZsSPvNQ3Fy5p7PpMt/8mltxTxMHj1Ur5NWbJdqIfpxgA==";
const HLJS_LIGHT_CSS_INTEGRITY =
  "sha512-0aPQyyeZrWj9sCA46UlmWgKOP0mUipLQ6OZXu8l4IcAmD2u31EPEy9VcIMvl7SoAaKe8bLXZhYoMaE/in+gcgA==";
const HLJS_DARK_CSS_INTEGRITY =
  "sha512-rO+olRTkcf304DQBxSWxln8JXCzTHlKnIdnMUwYvQa9/Jd4cQaNkItIUj6Z4nvW1dqK0SKXLbn9h4KwZTNtAyw==";

/**
 * HighlightStyles renders both code themes into the document head. The inline
 * head script (DocHead) disables the theme that does not match the stored
 * light/dark preference while the head is still parsing, so the correct colors
 * win before first paint and switching later never refetches anything.
 */
export function HighlightStyles(): ReactElement {
  return (
    <>
      <link
        rel="stylesheet"
        href={HLJS_LIGHT_CSS_URL}
        integrity={HLJS_LIGHT_CSS_INTEGRITY}
        crossOrigin="anonymous"
        data-hljs-theme="light"
      />
      <link
        rel="stylesheet"
        href={HLJS_DARK_CSS_URL}
        integrity={HLJS_DARK_CSS_INTEGRITY}
        crossOrigin="anonymous"
        data-hljs-theme="dark"
      />
    </>
  );
}

/**
 * HighlightScripts loads highlight.js at the end of the body and highlights
 * every `<pre><code>` block: goldmark supplies the language as a
 * `language-<lang>` class, and unlabelled blocks are auto-detected by
 * highlight.js itself. The script is deferred, so the library is defined by
 * the time DOMContentLoaded fires, which is when the inline call runs; a
 * blocked or failed CDN simply leaves the code uncolored, still readable
 * through the theme's own `.prose pre` styling.
 */
export function HighlightScripts(): ReactElement {
  return (
    <>
      <script
        src={HLJS_JS_URL}
        integrity={HLJS_JS_INTEGRITY}
        crossOrigin="anonymous"
        defer
      ></script>
      <script>
        {
          "window.addEventListener('DOMContentLoaded',function(){if(window.hljs)window.hljs.highlightAll()});"
        }
      </script>
    </>
  );
}
