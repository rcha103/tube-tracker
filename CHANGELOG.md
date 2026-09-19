# Changelog

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
