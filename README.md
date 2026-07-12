# Tube Tracker

> **A note on this project:** built with a *lot* of help from Claude
> (Anthropic's AI) — most of the code, architecture, and this README
> were written collaboratively with it. I'm not actively maintaining
> this; it was a personal project for my own use, shared as-is in case
> it's useful to someone else. I'll likely be slow to respond to issues
> or PRs, if I respond at all — so please feel free to fork it, adapt
> it, or take it in whatever direction you want.

A self-hosted app for tracking which transit stations you've visited —
built for the London Underground, but works for any city's rail/metro
network.

Two ways to mark stations visited:
- **Real map** — an actual geographic map (OpenStreetMap/satellite
  tiles), every station plotted at its real coordinates
- **Diagram** — upload your *own* copy of a transit map image and drop
  pins on it directly. This app doesn't ship any official transit
  authority's map artwork (many, including TfL's Tube map, are
  copyrighted and actively licensed) — you bring your own copy for
  personal reference, and pins calibrate to whatever image you upload

Both views share the same visited-state, so switching between them never
loses anything. Every city is fully independent — logo, name, stations,
lines, visited progress, pins, and diagram image all separate — and you
can add as many as you like.

## Features

**Tracking**
- Per-line visited tracking — a station on three lines can be fully or
  partially visited, tracked independently per line
- A station can have more than one pin on the diagram — some interchange
  stations are drawn as separate dots per line on official maps (e.g.
  Ealing Broadway: Central, District, and Elizabeth line each get their
  own dot), others as one combined dot (e.g. Blackfriars: Circle +
  District together). Both are supported per-pin
- "Free markers" for things on a map that aren't part of the network
  proper — river boat piers, cable car, anything else — added the same
  way as a station, with a custom colour of your choosing
- "Needs pins" indicator: if you mark a station visited from the real
  map, it won't automatically know where to place it on your uploaded
  diagram. A badge and list surface exactly which stations/lines still
  need a dot, with a guided drag-and-drop flow that auto-advances
  through the list

**Real map**
- Streets / Satellite / Dark tile layers
- Drag a green handle onto the map to add a brand-new station at that
  exact location — coordinates fill in automatically from the drop
  point, you just name it, set its line(s) and zone

**Diagram**
- Upload any image; drag-to-pan, scroll-to-zoom (cursor-anchored, like
  most map tools), pins scale proportionally with zoom instead of a
  fixed size, with a size slider per city
- Drag a pin handle onto the map to place and calibrate a station in one
  step; deleting a pin is a click away in its popup, no API calls needed

**Stations & lines**
- Station management screen: add/edit/delete by hand, or bulk
  import/export via JSON or Excel
- Typing a line name (when adding/editing a station) autocompletes
  against existing lines, so a typo doesn't silently create a duplicate
- Line management screen: add/edit lines and their colours (swatch
  picker, native colour picker, or hex code), see how many stations use
  each one

**Multi-city & branding**
- Add as many cities as you like; each is fully isolated
- Per-city logo (upload a transparent PNG) shown in the header and used
  as the browser tab favicon
- Per-city display name, shown in the header and the browser tab title —
  e.g. "TfL Map Tracker" for London, something else entirely for Paris

**Other**
- Ships with London's Underground pre-loaded (453 stations across 11
  Underground lines + DLR, London Overground, and the Elizabeth line)
- No external accounts, no telemetry, no cloud dependency — your data
  stays in a single SQLite file on your own machine

## Quick start

Requires Docker and Docker Compose.

```bash
git clone https://github.com/<your-username>/tube-tracker.git
cd tube-tracker
docker compose up -d --build
```

Open `http://localhost:8080`.

## Configuration

Copy `.env.example` to `.env` to change the host port:

```bash
cp .env.example .env
# edit PORT= in .env if 8080 is already taken
```

All app data (SQLite database, uploaded diagram images, per-city logos)
lives in `./data`, created automatically on first run. Back that folder
up if you want to preserve your progress — it's the only stateful part
of the app.

## Adding a city

Cities other than London start empty. From the header, use **+ Add
city…**, then either:
- Add stations one at a time via **Manage stations → + Add station**, or
  drag the green handle onto the real map to place one by dropping a pin
  at its actual location, or
- Import a JSON or Excel file (**Manage stations → Import file**) —
  format is `id` (optional), `name`, `lines` (comma-separated), `zone`,
  `lat`, `lon`. Export London first (**Manage stations → Export
  JSON/Excel**) to see the exact shape expected.

Set a logo (click the circle in the header) and a display name (the
pencil next to the title) to give the new city its own identity.

If you put together a good station dataset for another city and are
willing to share it, a pull request adding it as a seed dataset (same
pattern as London's) would be very welcome.

## How it's built

- **Backend**: Python (Flask) + SQLite, single container
- **Frontend**: vanilla JS + [Leaflet](https://leafletjs.com/) (vendored
  locally, no CDN dependency at runtime)
- No build step, no bundler — `app/static/index.html` is the entire
  frontend

## Data & attribution

The bundled London dataset is derived from OpenStreetMap via
[oobrien/vis](https://github.com/oobrien/vis) and remains under the
ODbL. See [NOTICE.md](NOTICE.md) for full attribution, including for
Leaflet and the map tile providers used at runtime.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — short version: this isn't
actively maintained, so response times will likely be slow, but issues
and PRs are still welcome.

## License

Application code is [MIT licensed](LICENSE). The bundled station dataset
has separate attribution requirements — see [NOTICE.md](NOTICE.md).
