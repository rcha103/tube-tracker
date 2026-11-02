# Changelog

## 3.0.2

**Bug fixes**
- Saving a pin (Add pin, Free marker, or placing a station from Needs
  pins) failed silently when the app was opened over plain HTTP, e.g. via
  a LAN or Tailscale IP address — browsers only provide the
  `crypto.randomUUID()` function used to generate pin ids on HTTPS or
  localhost. The app now falls back to an equivalent id generator that
  works everywhere

**Known limitation**
- Offline mode and installing as an app still require HTTPS (browsers
  only run service workers on secure pages), and iOS Safari with HTTPS-Only
  enabled refuses plain HTTP addresses entirely. For Tailscale setups,
  `tailscale serve` provides a private HTTPS address

## 3.0.1

**Bug fixes**
- Mobile: the Add pin and Free marker buttons were hidden underneath the
  pin size bar, which was meant to sit at the bottom of the screen but
  was showing over the diagram toolbar instead — pins and markers could
  not be added at all on phones (or in desktop windows 760px wide or
  narrower)
- Touch screens: tapping the diagram to add a pin opened the station
  picker and then immediately closed it again, so the pin could never be
  saved
- Mobile: the Needs pins list and the line picker / Continue button in
  the placing banner were cut off by the toolbar and couldn't be used;
  they now appear as a panel just above the pin size bar
- Desktop: the placing banner and tooltips told mouse users to "touch
  and drag" to place a pin, but a mouse drag pans the map — they now
  say to click the map (touch keeps the drag-to-fine-tune wording)

**PWA**
- Service worker cache version bumped so installed copies pick up the
  new version immediately instead of serving the previous cached page

## 3.0.0

**Mobile & touch**
- Diagram pin/marker/calibration placement now uses a magnifier-assisted
  precision drag on touch/pen: touch down shows a magnified loupe of
  exactly what's under your finger, drag to fine-tune, release to
  commit — no more mis-placed pins from fat-finger taps. Mouse keeps
  the original instant click-to-place
- The Add pin / Free marker handles are a proper two-way toggle: tap
  again (even mid-drag) to cancel and freely pan/pinch-zoom the
  diagram, tap again to re-arm
- "Manage stations" and "Manage lines" are now desktop-only, reducing
  header clutter on small screens
- Pin size control moved to its own dedicated bar pinned to the bottom
  of the screen on mobile (like a zoom control), instead of being
  squeezed into the scrolling toolbar row

**PWA**
- Online/offline indicator is now persistent and always visible once
  installed, instead of hiding when idle — it also actively checks
  real connectivity every 5 seconds, so a dropped or restored
  connection shows up immediately instead of only after your next
  write attempt
- Update-available notification: the header now shows the running
  version next to the stations-visited counter, and flags + links to
  the GitHub release notes when a newer version is out
- Automated image publishing to GHCR on tagged releases, so installs
  that auto-update (e.g. Watchtower) have a real registry image to
  poll

**Branding**
- Replaced the default logo placeholder and PWA install icons — no
  longer styled after the London Underground roundel, now a neutral
  generic mark, since the app supports any city

## 2.0.0

**Mobile & touch**
- Redesigned diagram map interaction for touch: tap-to-arm, tap-to-place
  station/pin placement instead of drag-and-drop
- Multi-touch pinch-to-zoom and pan on the diagram map
- Off-canvas slide-out drawer for line management on small screens
- Responsive layout pass across the app for phone-sized viewports

**Offline & installability**
- Installable as a PWA (Add to Home Screen on iOS/Android, desktop
  install) with app icons and a standalone launch experience
- Offline-first sync when installed as a standalone PWA: every change
  (cities, stations, visited status, pins, line colours, diagram/logo
  images) is queued locally and synced automatically when a connection
  is available
- Eager background caching of every city's diagram image and data so
  switching cities while offline still works
- Floating sync status indicator (offline / unsynced changes / synced)
- Regular browser tab usage is unchanged and does not attempt offline
  behaviour, avoiding iOS Safari's storage-eviction pitfalls

**Fixes**
- Diagram map no longer opens zoomed in on first load; it now
  correctly fits the window

## 1.0.0

Initial public release.

**Tracking**
- Multi-city support: independently scoped stations, lines, visited
  state, pins, diagram image, logo, and display name per city
- Per-line visited tracking (a multi-line station can be partially or
  fully marked visited)
- Multiple pins per station, each optionally scoped to a subset of its
  lines — supports both separate-dot interchanges (e.g. Ealing
  Broadway) and combined-dot interchanges (e.g. Blackfriars)
- Free markers for off-network points of interest (river boat piers,
  cable car, etc.), added as a station with a custom-picked colour
- "Needs pins" indicator + guided, auto-advancing calibration flow for
  stations marked visited from the real map but not yet placed on the
  diagram

**Real map**
- Leaflet-based map with Streets / Satellite / Dark tile layers
- Drag-and-drop handle to add a new station directly at a dropped
  location, coordinates filled in automatically

**Diagram**
- Upload your own transit map image; drag-to-pan, cursor-anchored
  scroll-to-zoom, pins that scale proportionally with zoom (with a
  per-city size slider) instead of a fixed pixel size
- Drag-a-pin-to-place station calibration; per-pin deletion from its
  popup

**Stations & lines**
- Station management screen: manual add/edit/delete, autocomplete on
  the lines field to prevent accidental duplicates, bulk import/export
  via JSON or Excel
- Line management screen: add/edit lines and colours (swatches, native
  picker, or hex input), see station counts per line

**Branding**
- Per-city logo upload, shown in the header and used as the browser tab
  favicon
- Per-city editable display name, shown in the header and browser tab
  title

**Other**
- Ships with London's Underground network pre-loaded (453 stations, 11
  Underground lines + DLR, London Overground, Elizabeth line)
- Single Docker container, SQLite storage, no external accounts or
  telemetry
