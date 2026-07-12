# Third-party notices

This project bundles or depends on data and code from the following
sources. If you fork or redistribute this project, please keep these
attributions.

## London station data (`app/static/stations.json`)

Derived from [oobrien/vis](https://github.com/oobrien/vis)
(`tubecreature/data/tfl_stations.json`), which is itself derived from
[OpenStreetMap](https://www.openstreetmap.org/copyright) data.

© OpenStreetMap contributors, available under the
[Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).
If you modify and redistribute this dataset, ODbL's share-alike terms
apply to the *data*, separately from the MIT license covering the
application code.

## Leaflet (`app/static/vendor/leaflet/`)

[Leaflet](https://leafletjs.com/), © 2010–2024 Volodymyr Agafonkin,
© 2010–2011 CloudMade. Vendored locally rather than loaded from a CDN, so
the app has no external JS dependency at runtime. Licensed under
[BSD-2-Clause](https://github.com/Leaflet/Leaflet/blob/main/LICENSE).

## Map tile providers (loaded at runtime by the browser, not bundled)

- **Streets** — [OpenStreetMap](https://www.openstreetmap.org/copyright)
  standard tiles. Please respect the
  [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
  if self-hosting this for anything beyond light personal use — consider
  running your own tile server or using a paid provider for heavier use.
- **Dark** — [CARTO](https://carto.com/attributions) basemaps.
- **Satellite** — [Esri World Imagery](https://www.esri.com/).

None of these tile providers are affiliated with this project; usage of
each is subject to its own provider's terms.
