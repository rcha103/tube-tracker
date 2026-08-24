# Changelog

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
