import type { ReactElement } from "react";

import { go } from "../lib/go";

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
 * Runs once the document is parsed, in the order that guarantees highlight.js
 * (deferred, so it runs before DOMContentLoaded) is already loaded. It
 * highlights every code block, then wraps each one in a container with a bar
 * holding the language name and a copy button.
 *
 * The language comes from the class highlight.js resolved — it rewrites the
 * element to `hljs language-<lang>`, including for auto-detected blocks — and
 * falls back to the author's own fence label when highlight.js does not know
 * the language and skips the block entirely.
 *
 * The bar is presentation only: with JavaScript off the page still shows the
 * same code, just without it. Labels are read from #vexgo-code-labels; the
 * copy itself uses the async clipboard API and falls back to a hidden textarea
 * + execCommand for plain-HTTP deployments, where the clipboard API is not
 * available outside a secure context.
 */
const HIGHLIGHT_INIT = `(function(){
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
  document.addEventListener('DOMContentLoaded',function(){
    if(window.hljs)window.hljs.highlightAll();
    var holder=document.getElementById('vexgo-code-labels');
    function attr(name,fallback){return (holder&&holder.getAttribute('data-'+name))||fallback}
    var copyLabel=attr('copy-label','Copy'),copiedLabel=attr('copied-label','Copied'),copyAria=attr('copy-aria','Copy code');
    function wire(btn,text,status,code){
      var timer;
      function done(){text.textContent=copiedLabel;btn.setAttribute('data-copied','');status.textContent=copiedLabel;clearTimeout(timer);timer=setTimeout(function(){text.textContent=copyLabel;btn.removeAttribute('data-copied');status.textContent=''},1600)}
      function fallback(value){var ta=el('textarea');ta.value=value;ta.style.position='fixed';ta.style.top='-1000px';document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(ta);if(ok)done()}
      btn.addEventListener('click',function(){var value=code.textContent||'';if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value).then(done,function(){fallback(value)})}else{fallback(value)}})
    }
    var blocks=document.querySelectorAll('.prose pre > code');
    for(var i=0;i<blocks.length;i++){
      var code=blocks[i],pre=code.parentNode;
      var match=/(?:^|\\s)language-([\\w+#.-]+)/.exec(code.className||'');
      var lang=match?match[1]:((code.result&&code.result.language)||'');
      var btn=el('button','vexgo-code-copy'),text=el('span','vexgo-code-copy-text',copyLabel),status=el('span','vexgo-code-status');
      btn.type='button';btn.setAttribute('aria-label',copyAria);
      status.setAttribute('role','status');status.setAttribute('aria-live','polite');
      btn.appendChild(text);
      var bar=el('div','vexgo-code-bar',null);
      bar.appendChild(el('span','vexgo-code-lang',lang));
      bar.appendChild(btn);
      bar.appendChild(status);
      var wrap=el('div','vexgo-code',null);
      pre.parentNode.insertBefore(wrap,pre);
      wrap.appendChild(bar);
      wrap.appendChild(pre);
      wire(btn,text,status,code)
    }
  })
})();`;

/**
 * HighlightScripts loads highlight.js at the end of the body and highlights
 * every `<pre><code>` block: goldmark supplies the language as a
 * `language-<lang>` class, and unlabelled blocks are auto-detected by
 * highlight.js itself. The script is deferred, so the library is defined by
 * the time DOMContentLoaded fires, which is when the inline call runs; a
 * blocked or failed CDN simply leaves the code uncolored, still readable
 * through the theme's own `.prose pre` styling.
 *
 * The hidden label holder next to it carries the copy button's strings from
 * the theme's i18n dictionary, so the inline script itself stays free of
 * hardcoded text and follows whatever language the page resolved.
 */
export function HighlightScripts(): ReactElement {
  return (
    <>
      <div
        id="vexgo-code-labels"
        hidden
        data-copy-label={go('t "code.copy"')}
        data-copied-label={go('t "code.copied"')}
        data-copy-aria={go('t "a11y.copyCode"')}
      ></div>
      <script
        src={HLJS_JS_URL}
        integrity={HLJS_JS_INTEGRITY}
        crossOrigin="anonymous"
        defer
      ></script>
      <script>{HIGHLIGHT_INIT}</script>
    </>
  );
}
