# Tube Tracker — project context for Claude Code

Flask + vanilla-JS transit-station tracker. Single-file frontend
(`app/static/index.html`, ~2900 lines), SQLite backend
(`app/app.py`, per-request `sqlite3.connect`, no ORM), Docker-shipped.

## Architecture at a glance

- **Backend**: `app/app.py` — Flask, `static_url_path=""` (static files
  served at site root, not `/static/`). SQLite, no migrations framework.
- **Frontend**: `app/static/index.html` — one file, inline `<script>`,
  no build step, no framework. `api()` helper centralizes `/api/...`
  URL-building for nearly every fetch call.
- **PWA**: `app/static/manifest.json`, `app/static/sw.js`,
  `app/static/icons/`.
- Ships pre-loaded with London's Underground network
  (`app/static/stations.json`: 453 stations, 11 lines + DLR/Overground/
  Elizabeth line), but the app is generic — supports multiple
  independently-scoped cities (own stations, lines, visited state,
  pins, diagram image, logo, display name).
- **Version badge / update notification**: `app/app.py`'s
  `APP_VERSION` constant is the single source of truth the frontend
  compares against. `#app-version-badge` sits in the header right
  next to the stations-visited counter (`.overall`), always showing
  `vX.Y.Z`. On every page load, `checkForUpdate()` in `index.html`
  hits `/api/version` for the running version, then calls
  `https://api.github.com/repos/<repo>/releases/latest` directly from
  the browser (public GitHub REST endpoint, CORS-enabled, no backend
  proxy needed); if that tag is newer, the badge swaps its text to
  the new tag, turns into a link (`.update-available` styling), and
  clicking it opens the GitHub release notes in a new tab. Best-effort
  only — silently leaves the current-version text showing if
  offline/rate-limited. `GITHUB_REPO` in `app.py` must stay in sync
  with the actual repo slug.
- **CI/CD**: `.github/workflows/docker-build.yml` runs a build +
  health-check smoke test on every push/PR to `main`.
  `.github/workflows/publish.yml` builds and pushes
  `ghcr.io/rcha103/tube-tracker` on `v*` tag pushes (context is
  `./app`, since that's where the `Dockerfile` and its `COPY` sources
  live — not repo root) — this is what Watchtower on the deploy
  device polls instead of a nonexistent Docker Hub image.
- **Default branding is intentionally generic, not TfL-styled**: the
  original v2.0.0 default logo/PWA icons were a red-ring-blue-bar
  `.roundel` CSS motif that read as the TfL roundel — inappropriate
  for a city-agnostic app that just happens to ship London data by
  default. Replaced with a neutral hollow-ring mark (no brand
  association, echoes the app's own map-marker visual language
  instead): `.logo-placeholder-default` (dashed neutral ring, header
  empty state) and the 4 files in `app/static/icons/` (plain
  `--text` #e9edf1 ring on `--bg` #0d1013, regenerated via the same
  one-off local Pillow approach, script not checked in). The
  `--accent-2` CSS variable (the old roundel blue) was removed as
  dead code once nothing referenced it.
- **Diagram-pin placement magnifier (touch precision assist)**: a
  touch/pen finger is much less precise than a mouse cursor, so on
  `#diagram-canvas` a touch/pen pointerdown while a placement is
  armed (`add-pin-handle`/`free-marker-handle`) or a calibration is
  in `'placing'` phase (`diagramPlacementActive()`) no longer places
  immediately — it starts a `{mode:'place'}` gesture (see
  `diagramGesture` in `onCanvasPointerDown`/`Move`/`Up`) that shows a
  magnified loupe (`#diagram-magnifier`, created on demand, positioned
  ~90px above the finger since the finger itself covers the target
  point) tracking the drag; the canvas does not pan during this drag.
  Release commits the pin/marker/calibration point at the *final*
  dragged position via the existing `handleDiagramTap()`, regardless
  of how far the finger moved (unlike a plain tap, which requires no
  movement). Mouse/no-armed-placement behavior is completely
  unchanged — instant click-to-place, no magnifier — gated on
  `e.pointerType === 'touch' || 'pen'`. A second finger touching
  mid-drag is deliberately ignored (not treated as pinch-to-zoom);
  this guard was validated with a jsdom-based test harness (not
  checked in) since it's easy to get the multi-touch bookkeeping
  subtly wrong — a first attempt let a stray second finger's release
  corrupt the gesture and silently drop the placement.
  `add-pin-handle`/`free-marker-handle` are a genuine two-way toggle
  (`setPlacementArmed()`, unchanged from before): tapping again while
  armed fully disarms, which is also the *only* way to freely
  pan/pinch-zoom the diagram once armed — while armed, any single
  touch on the canvas commits to a placement drag rather than
  panning, so there's no in-between "look around without committing"
  state. `cancelDiagramPlaceGesture()` (called from
  `setPlacementArmed`/`disarmPlacement`, so also on the existing
  Escape-key handler) makes disarming *mid-drag* actually abort
  immediately — hides the magnifier and drops the tracked pointer
  right away — instead of leaving the drag live until the finger
  lifts (which used to silently no-op the release rather than
  respecting the just-toggled-off state).
- **`#manage-stations-btn`/`#manage-lines-btn` are desktop-only**:
  hidden via `display:none` inside `@media (max-width:760px)`
  (deliberate declutter choice, not an oversight) — these CRUD panels
  (`openManagePanel`/`openManageLinesPanel`) are still reachable on
  desktop; on mobile there is currently no equivalent entry point.
  The elements still exist in the DOM (just hidden), so their
  `onclick` bindings are harmless no-ops on mobile rather than errors.
- **Pin-size slider is a dedicated bottom bar on mobile**: on desktop
  `#pin-size-control` sits inline in the scrolling `#diagram-toolbar`
  row like everything else; on mobile (`@media max-width:760px`) it's
  pulled out via `position:fixed; left:0; right:0; bottom:0;` into
  its own full-width bar (Word-zoom-control-style) instead of being
  squeezed among the other toolbar buttons — no HTML/JS changes, same
  element/ids, purely a CSS repositioning. `#diagram-scroll`'s
  `bottom` is offset to `52px` (the bar's height) so the canvas
  doesn't render underneath it, and `#sync-status-pill`'s `bottom` is
  bumped to `64px` on mobile so it can't visually collide with the
  new bar when both happen to be showing (installed-PWA + Diagram
  tab). z-index is `900` — above the toolbar/canvas, but deliberately
  below the `aside` lines drawer (`1500`) and modal backdrops
  (`2000`) so those still correctly cover it when open.
- **Sync/connectivity pill is now persistent, not auto-hiding**: v2.0.0
  shipped this pill with a "hidden" terminal state (see the v2.0.0
  section below) — it's since been replaced with a permanent `ONLINE`
  (green) baseline state so the pill is always visible once
  `STANDALONE`, never disappears. `renderSyncPill()` no longer has a
  `'hidden'` case at all. Precedence is now OFFLINE (red) > UNSYNCED
  (yellow) > SYNCED (green, 5s flash) > ONLINE (green, persistent).
  Connectivity ground truth is also no longer *reactive-only* (waiting
  on a write attempt or an `online`/`offline` browser event, which are
  known to lie — e.g. captive portals): `checkConnectivity()` does a
  real network round-trip (`fetch('/health', {cache:'no-store'})`,
  intentionally not cached — `/health` isn't in the service worker's
  shell/API/image cache buckets in `sw.js`, so this always hits the
  real network) on a `CONNECTIVITY_CHECK_MS` (5000ms) interval,
  replacing the old conditional 30s "only if queue non-empty"
  fallback. `online`/`offline` events now trigger an immediate
  `checkConnectivity()` (verify-before-trusting) rather than
  short-circuiting straight to "assume online".

## v2.0.0 (2026-08-24) — what changed and why

Three goals, all shipped in commit `65ad4fe` / tag `v2.0.0`. Full
details in `CHANGELOG.md`.

### 1. Diagram map zoom-fit bug
`fitDiagramToWindow()` used to run while `#diagram-view` was
`display:none`, producing a bogus negative scale and opening zoomed
in. Fixed with a size-guard + `diagramFitted` flag, fit is triggered on
first switch into diagram view.

### 2. Mobile/touch redesign
Deliberately rethought pin/station placement for touch instead of
adapting mouse drag-and-drop:
- **Tap-to-arm, tap-to-place**: chosen over drag-and-drop after
  explicit user direction to "rethink the pin dropping" for touch.
  See `placementArmed` / `setPlacementArmed` / `disarmPlacement` /
  `updatePlacementUI` in `index.html`.
- Multi-touch pinch-zoom/pan on the diagram canvas via the Pointer
  Events API (`diagramPointers`, `diagramGesture`,
  `beginDiagramPinch`, `handleDiagramTap`, `zoomDiagramAtPoint`) —
  unifies mouse and touch handling in one state machine.
- Off-canvas slide-out `aside` drawer for line management on small
  screens (`setAsideOpen`, `#lines-toggle-btn`, `#aside-backdrop`).
- Responsive CSS: `@media (max-width:760px)`, `@media (pointer:coarse)`.
- Old `.pin-ghost` drag CSS and `initDragHandle()` were removed
  entirely, not left as dead code.
- Known WebKit gotcha: `canvas.setPointerCapture(e.pointerId)` can
  throw `NotFoundError` for pointer IDs the browser doesn't yet
  consider "active" — wrap in try/catch and register the pointer in
  `diagramPointers` regardless of whether capture succeeds, or touch
  sequences silently abort.

### 3. PWA installability + offline-first sync
Scoped deliberately to avoid known iOS Safari failure modes:

- **Plain browser tab**: no offline apparatus at all. iOS Safari
  in-tab has no Background Sync API and evicts IndexedDB/Cache
  Storage after ~7 days of inactivity for non-installed sites, so
  promising offline durability there would be a lie.
- **Installed standalone PWA** (`STANDALONE` = `matchMedia
  ('(display-mode: standalone)').matches || navigator.standalone`):
  iOS treats installed-PWA storage far more durably, so this is where
  offline reads + a durable write queue are attempted.
- Service worker registers **unconditionally** (harmless in a tab,
  needed for installability). Everything else is gated behind
  `if (STANDALONE)`.
- **Write queue**: `window.fetch` is monkey-patched (one guarded
  patch instead of rewriting ~27 call sites) to intercept same-origin
  `/api/` POST/PUT/DELETE. A network failure enqueues the request
  into IndexedDB (`tube-tracker-offline` / `writeQueue`, autoIncrement
  = FIFO replay order); a reachable server (even 4xx/5xx) is treated
  as "not offline" and passes through normally.
- **Idempotent replay** required two small backend changes (in
  `app/app.py`) since the queue may replay a write that already
  landed:
  - `create_pin`: now accepts a client-supplied `id`,
    `INSERT ... ON CONFLICT(id) DO NOTHING`, returns the DB row.
  - `toggle_visited`: now accepts optional explicit `{"visited": bool}`
    in the body instead of only toggling — replaying a queued POST
    twice no longer flips state an extra time. Old no-body toggle
    behavior is preserved for backward compatibility.
  - `POST /api/cities` and `.../stations` were already idempotent
    (409 on existing id, no side effects) — frontend treats a replay
    409 as "already succeeded."
  - IDs for new cities/stations/pins are generated **client-side**
    up front (`slugify()`, `crypto.randomUUID()`) so optimistic UI
    and replay can share the same id, and synthetic `Response`
    objects can be fabricated for the 6 call sites that read
    `response.json()`.
- **Sync status pill** (`#sync-status-pill`, bottom-center,
  `STANDALONE`-only): OFFLINE (red) > UNSYNCED (yellow) > SYNCED
  (green, auto-hides after 5s) > hidden, in that precedence order.
  `online`/`offline` browser events are treated as hints, not proof —
  ground truth comes from actual fetch success/failure, since
  `navigator.onLine` is known to lie (captive portals etc). A 30s
  interval is the fallback retry when those events don't fire.
  Background Sync API was deliberately **not** used — unsupported on
  iOS Safari, the platform this design targets.
- **Eager multi-city prefetch**: on load, when standalone and online,
  every *other* city's data + diagram image is fetched
  fire-and-forget (not just the currently open city) so switching
  cities while offline still works. Real map tiles (Leaflet/OSM/
  CartoDB/ArcGIS, cross-origin, ToS-restricted) are explicitly
  **not** cached — Diagram tab is the offline-capable map view, Real
  map stays online-only by design.
- Service worker (`app/static/sw.js`): versioned caches
  (`tt-shell-v1`/`tt-api-v1`/`tt-img-v1`), cache-first for the app
  shell, network-first-with-cache-fallback for `/api/` data and
  diagram/logo images (image cache keys strip the `?t=` cache-busting
  query param). Only intercepts GET; writes always pass through
  untouched — the write queue lives entirely in page JS, not
  duplicated in the SW. Cross-origin requests are never intercepted.
- Manifest icons (`app/static/icons/`) were generated from the
  existing `.roundel` CSS motif (red `#dc241f` ring, blue `#0019a8`
  bar, `#0d1013` background) via a one-off local Pillow script — not
  checked in, not part of `requirements.txt`.

### Known limitations (stated, not gaps to silently fix)
- No real iOS device was used to verify any of this — implemented
  defensively per Apple's documented PWA storage behavior, verified
  as thoroughly as possible via Chrome's installed-window
  `display-mode: standalone` as the closest available proxy.
- Manifest is static: the installed PWA's home-screen icon/name is
  always the generic Tube Tracker mark (see icon note below), not
  per-city branding (branding is runtime-only via
  `applyCityBranding()`/`loadCityLogo()`).
- Sync only happens while the app is open (no Background Sync) — by
  design, not an oversight.

## Environment gotchas (this dev machine, Windows)

- `python3` alias is broken in Git Bash here (Microsoft Store shim
  error) — use plain `python`.
- Stale `python.exe` dev-server processes can leave duplicate
  `LISTENING` sockets on the same port (Windows `netstat` quirk);
  `pkill -f <pattern>` does **not** reliably kill them. Use
  `netstat -ano | grep ":<port>" | grep LISTENING` then
  `taskkill //F //PID <pid>` for each stale PID.
- `gh` CLI was installed via `winget install --id GitHub.cli`; PATH
  needs `C:\Program Files\GitHub CLI` appended in new shells until a
  terminal restart picks up the system PATH change.

## Release process used for v2.0.0 (repeatable)

1. Update `CHANGELOG.md` (new `## X.Y.Z` section, same categorized
   bullet-list format as existing entries).
2. Bump the version in **two** places (must match or the
   update-notification pill will misfire): `LABEL
   org.opencontainers.image.version` in `app/Dockerfile`, and
   `APP_VERSION` in `app/app.py`.
3. `git add` the specific changed files (not `-A`), commit.
4. `git tag -a vX.Y.Z -m "..."`.
5. Confirm with the user, then `git push origin main && git push
   origin vX.Y.Z` — the tag push also triggers
   `.github/workflows/publish.yml`, publishing the new image to GHCR.
6. `gh release create vX.Y.Z --title "vX.Y.Z" --notes-file <notes>`
   (notes mirror the changelog entry) — this is also what the
   update-notification pill links to and reads `tag_name`/`html_url`
   from via the GitHub API.

Repo: `rcha103/tube-tracker` (public). `gh` is authenticated as
`rcha103` on this machine.
