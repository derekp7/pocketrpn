/* PocketRPN service worker - app-shell offline support.
   Bump CACHE on every release so returning visitors get the new build. */
const CACHE = 'pocketrpn-v17';
/* Legacy cache-name prefixes from before the PocketRPN rename. activate()
   deletes these explicitly: an installed app only picks up a changed
   short_name when a NEW WebAPK is built, and that can take days - during
   which time it keeps serving its cached copy of the manifest. Clearing the
   old caches forces a fresh network fetch instead. */
const LEGACY_CACHE_PREFIXES = ['rpn-calc-'];
const SHELL = [
  './',
  './index.html',
  './decimal.min.js',
  './docs.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) =>
        k !== CACHE || LEGACY_CACHE_PREFIXES.some((p) => k.startsWith(p))
      ).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never touch cross-origin

  /* Page navigations - and docs.js - network-first so updates land, cache as the
     offline fallback. The documentation gets navigation treatment because it is
     edited on its own schedule: cache-first would hold a help file weeks behind
     the prose written for it, dislodgeable only by a code release that bumps
     CACHE. Online it revalidates each launch; offline the copy primed from SHELL
     answers, so Help still opens with no network at all. */
  if (req.mode === 'navigate' || url.pathname.endsWith('/docs.js')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          // Navigations are stored under './', the key SHELL primes and the
          // fallback below asks for; anything else keeps its own URL, or a
          // revalidated docs.js would overwrite the cached page with itself.
          caches.open(CACHE).then((c) => c.put(req.mode === 'navigate' ? './' : req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r ||
            // Only a page has './'; handing index.html back for a missing docs.js
            // would serve HTML where a script is expected. Failing the request
            // outright is what lets the app say "documentation unavailable".
            (req.mode === 'navigate' ? caches.match('./') : Response.error())))
    );
    return;
  }

  // Everything else (icons, this document's own subresources): cache-first.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
