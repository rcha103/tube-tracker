# Contributing

Thanks for considering a contribution. Quick heads up: this project
isn't actively maintained (see the note at the top of the README), so
issues and PRs may sit for a while before anyone looks at them, if at
all. If you need something fixed or extended, forking is probably more
reliable than waiting on a review here — but PRs are still genuinely
welcome if you're up for it.

## Development setup

No build step — clone the repo and run it the same way an end user
would:

```bash
docker compose up -d --build
```

Edits to `app/app.py` or `app/static/index.html` need a rebuild to take
effect (`docker compose up -d --build` again). There's no hot-reload
set up yet — a welcome contribution if you'd like to add one (Flask's
debug mode plus a bind-mounted `app/` directory would do it).

## Adding a city's seed dataset

If you'd like to contribute a bundled dataset for another city (so it
ships pre-loaded like London does), follow the shape of
`app/static/stations.json`:

```json
[
  { "id": "unique-id", "name": "Station Name", "lines": ["Line A", "Line B"], "zone": "1", "lat": 52.52, "lon": 13.40 }
]
```

Open an issue first if you're not sure a particular city's data is
suitable (licensing matters — see [NOTICE.md](NOTICE.md) for how
London's is attributed).

## Bug reports

Please include:
- Steps to reproduce
- Browser/OS
- Whether it's the real-map view, diagram view, or station management
  screen

## Pull requests

Small, focused PRs are easier to review than large ones. If you're
planning something substantial, open an issue first to discuss the
approach.
