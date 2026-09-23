import { go } from "../lib/go";
import { HighlightStyles } from "./CodeHighlight";
import { Check, Globe, Moon, Search, Sun } from "./icons";

/** ThemeToggle renders a dark/light switch for the public pages.
 *
 * Public pages are server-side rendered with no client framework, so this is
 * a plain button wired by the inline vanilla-JS handler below. It shares the
 * admin SPA's localStorage `theme` key (light | dark | system, defaulting to
 * light) so the preference carries over to /admin. The two icons swap via
 * Tailwind's `dark:` variant — the moon shows in light mode, the sun in dark —
 * and on pages that load highlight.js the handler also swaps the code theme
 * through the vexgoApplyHljsTheme helper (see DocHead).
 */
export function ThemeToggle() {
  return (
    <>
      <button
        id="vexgo-theme-toggle"
        type="button"
        aria-label={go('t "a11y.themeToggle"')}
        title={go('t "a11y.themeToggle"')}
        className="inline-flex items-center justify-center rounded-md h-9 w-9 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground text-muted-foreground"
      >
        <Moon className="w-4 h-4 dark:hidden" />
        <Sun className="w-4 h-4 hidden dark:block" />
      </button>
      <script>
        {
          "(function(){var b=document.getElementById('vexgo-theme-toggle');if(!b)return;b.addEventListener('click',function(){var r=document.documentElement;var d=!r.classList.contains('dark');r.classList.remove('light','dark');r.classList.add(d?'dark':'light');r.style.colorScheme=d?'dark':'light';if(window.vexgoApplyHljsTheme)window.vexgoApplyHljsTheme(d);try{localStorage.setItem('theme',d?'dark':'light')}catch(e){}});})();"
        }
      </script>
    </>
  );
}

/** LanguageSwitcher renders an icon dropdown for zh/en switching.
 *
 * Public pages are server-side rendered with no client framework, so this is
 * a plain button + menu wired by the inline vanilla-JS handler below:
 * - the globe button toggles the menu (closes on outside click / Escape)
 * - the active language is detected from `<html lang>` and marked with a check
 * - clicking an option preserves existing query params and only sets `lang`
 * - the raw `href="?lang=.."` remains as a no-JS fallback
 */
export function LanguageSwitcher() {
  return (
    <div id="vexgo-lang" className="relative">
      <button
        id="vexgo-lang-toggle"
        type="button"
        aria-label={go('t "a11y.languageMenu"')}
        title={go('t "a11y.languageMenu"')}
        aria-haspopup="menu"
        aria-expanded="false"
        className="inline-flex items-center justify-center rounded-md h-9 w-9 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground text-muted-foreground"
      >
        <Globe className="w-4 h-4" />
      </button>
      <div
        id="vexgo-lang-menu"
        role="menu"
        hidden
        className="absolute right-0 top-full z-50 mt-2 w-36 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      >
        <a
          href="?lang=zh"
          role="menuitem"
          data-lang="zh"
          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span>中文</span>
          <Check className="w-4 h-4" data-check="zh" />
        </a>
        <a
          href="?lang=en"
          role="menuitem"
          data-lang="en"
          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span>English</span>
          <Check className="w-4 h-4" data-check="en" />
        </a>
      </div>
      <script>
        {
          "(function(){var r=document.getElementById('vexgo-lang');var b=document.getElementById('vexgo-lang-toggle');var m=document.getElementById('vexgo-lang-menu');if(!r||!b||!m)return;function set(o){m.hidden=!o;b.setAttribute('aria-expanded',o?'true':'false')}var c=(document.documentElement.lang||'zh').toLowerCase();var zh=c.indexOf('zh')===0;m.querySelectorAll('[data-check]').forEach(function(e){var w=e.getAttribute('data-check')==='zh';e.style.visibility=(w===zh)?'visible':'hidden'});b.addEventListener('click',function(e){e.stopPropagation();set(m.hidden)});document.addEventListener('click',function(e){if(!r.contains(e.target))set(false)});document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});m.querySelectorAll('a[data-lang]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var l=a.getAttribute('data-lang');try{var u=new URL(window.location.href);u.searchParams.set('lang',l);window.location.href=u.toString()}catch(err){window.location.href='?lang='+l}})})})();"
        }
      </script>
    </div>
  );
}

/** SiteHeader is the top navigation bar shared by every public page. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            {go("if .Site.Icon")}
            <img src={go(".Site.Icon")} alt="Logo" className="w-8 h-8" />
            {go("end")}
            <span className="text-xl font-bold hidden sm:inline">
              {go(".Site.Name")}
            </span>
          </a>

          {/* Search box - desktop */}
          <form
            action="/"
            method="get"
            className="hidden md:flex flex-1 max-w-md"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                name="search"
                placeholder={go('t "search.placeholder"')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </form>

          {/* Nav links - desktop: Home plus custom pages */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground h-9 px-4 py-2 text-muted-foreground"
            >
              {go('t "nav.home"')}
            </a>
            {go("range .Pages")}
            <a
              href={go(".URL")}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground h-9 px-4 py-2 text-muted-foreground"
            >
              {go(".Title")}
            </a>
            {go("end")}
          </nav>

          {/* Auth entry: Login/Register for guests, Profile when a session
              exists (the SPA stores its session in localStorage). */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
            <div
              id="vexgo-auth"
              className="flex items-center gap-2"
              data-login-label={go('t "auth.login"')}
              data-register-label={go('t "auth.register"')}
              data-profile-label={go('t "auth.profile"')}
            >
              <a
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground h-9 px-4 py-2 text-muted-foreground"
              >
                {go('t "auth.login"')}
              </a>
              <a
                href="/admin/register"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                {go('t "auth.register"')}
              </a>
            </div>
          </div>
        </div>
      </div>
      <script>
        {
          "(function(){var h=document.getElementById('vexgo-auth');if(!h||!localStorage.getItem('token'))return;var login=h.getAttribute('data-login-label')||'Login';var register=h.getAttribute('data-register-label')||'Register';var profile=h.getAttribute('data-profile-label')||'Profile';var a=document.createElement('a');a.href='/admin/profile';a.className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2';a.textContent=profile;h.textContent='';h.appendChild(a);void login;void register;})();"
        }
      </script>
    </header>
  );
}

/** SiteFooter is the footer shared by every public page. */
export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            {go("if .Site.Icon")}
            <img src={go(".Site.Icon")} alt="Logo" className="w-6 h-6" />
            {go("end")}
            <span className="font-semibold">{go(".Site.Name")}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 {go(".Site.Name")}. {go('t "footer.rights"')}
          </p>
          <div className="flex gap-4">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {go('t "nav.home"')}
            </a>
            {go("range .Pages")}
            <a
              href={go(".URL")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {go(".Title")}
            </a>
            {go("end")}
            <a
              href="/admin/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {go('t "auth.login"')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Head bootstrap script: applies the stored light/dark preference to <html>
 * before first paint, so the page never flashes the wrong theme. */
const THEME_BOOTSTRAP =
  "(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(d?'dark':'light');r.style.colorScheme=d?'dark':'light';}catch(e){}})();";

/** Head bootstrap for pages that load highlight.js: same theme resolution, plus
 * vexgoApplyHljsTheme — the helper ThemeToggle calls — which disables whichever
 * of the two code stylesheets does not match. Running it here keeps the swap
 * before first paint, so switching light/dark later is instant and flash-free. */
const THEME_BOOTSTRAP_HIGHLIGHT =
  "(function(){function a(d){var l=document.querySelectorAll('link[data-hljs-theme]');for(var i=0;i<l.length;i++){l[i].disabled=(l[i].getAttribute('data-hljs-theme')==='dark')!==d}}window.vexgoApplyHljsTheme=a;var d=false;try{var t=localStorage.getItem('theme');d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){}var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(d?'dark':'light');r.style.colorScheme=d?'dark':'light';a(d)})();";

/** DocHead renders the shared <head> metadata with per-page title/description.
 *
 * Pass `highlightCode` on the templates whose content can contain code blocks
 * (post, page, timeline, links): it adds the highlight.js stylesheets and the
 * bootstrap that keeps them in step with the light/dark toggle. Pages that pass
 * nothing load exactly what they did before. */
export function DocHead({
  title,
  description,
  highlightCode = false,
}: {
  title: string;
  description: string;
  highlightCode?: boolean;
}) {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="stylesheet" href="/theme-assets/style.css" />
      {highlightCode ? <HighlightStyles /> : null}
      <script>
        {highlightCode ? THEME_BOOTSTRAP_HIGHLIGHT : THEME_BOOTSTRAP}
      </script>
    </head>
  );
}
