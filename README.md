# Grocery Bot 3D map preview: Bodø

A copy of [grocery-bot-3d-hills-preview](https://github.com/BusinessManBab/grocery-bot-3d-hills-preview)
built for **Bodø** with the steps in [OTHER-CITIES.md](OTHER-CITIES.md):

- Real terrain: the 3D map is draped over an elevation grid of Bodø (`data/terrain.bin`,
  435 × 409 samples, 0–161 m, relief ×1.2). Roads, buildings, trees, shops, trucks
  (pitched on slopes) and trails follow the ground; the board edge shows the hills in section.
- The whole play area is kept, not cropped: the harbour and sentrum peninsula, the airport
  peninsula, Rønvik, Bodøsjøen and the eastern districts inside the town's play-area polygon.
- The real street network, the sea, lakes, green areas and place names from OpenStreetMap
  (`data/game-map.json`), with 81 of 83 delivery homes matched to real building footprints
  (`data/buildings.json`).
- **Cartoon buildings**: 8,985 OSM footprints with pitched roofs, eaves and gable ends,
  window bays on the walls and muted per-building wall/roof colours from OSM `building:colour`,
  `roof:colour`, `height` and `building:levels` (`src/buildings3d.js`). Context buildings stay
  paler than the order homes, so highlighted orders still stand out.
- **Forest on the 2D map too**: `src/forest.js` plants the same deterministic forest for both
  views; the 2D map paints green under those trees, and the 3D view grows them as instanced
  spruce and birch (10,221 trees here, no trees in water).
- Sea, lakes and the harbour: the sea is clamped flat and still, with no current streaks;
  water areas get current only when they are inland streams big enough to flow.
- Bridges: road-over-water crossings (1 on this map) get a raised deck, railings and piers;
  trucks drive over them.
- 10 place labels, looked up in OSM: Bodø domkirke, Bodø sentrum, Bodø stasjon,
  Hurtigruteterminalen, Bodø lufthavn, Luftfartsmuseet, Bodø Spektrum, Rønvik, Bodøsjøen
  and Bodø havn.
- Shop window (bottom right): the v1 grocerybot.no store animation (Erik's `arena.js`, ported
  to `src/shop-iso.js`) showing the robots and trucks inside a shop as the match plays, switched
  by clicking any shop **or any row in Standings**. Clicking a player's row opens that player's
  shop and reopens the window if it was closed; × closes it.
  - **The v1-store layout**: four signed departments from the back wall to the door — Dairy
    (fridges), Pantry (shelves), Produce (bins) and Bakery (bread racks) — with a spine and
    two-tile aisles. The recorded match really picks milk from the dairy fridges
    (`tools/simulate_match.py`, 23 × 12 grid, 4 departments, 48 fixture cells).
  - **Map-style truck roofs**: the trucks in the bays use the player's own `looks.js` truck art
    and roof: flatbed crates for Plum Pusher, a cooler box for Rush AI, a canvas hood for Kale
    Storm, and the matching cab, visor, decal and colour, plus the rear loading door, cargo and
    order tag.
- The replay is a simulated 5-seat, 600-tick match with the user's rush-ai, recorded from the
  engine on the Bodø map (`tools/simulate_match.py ... 7 bodo`). Kale Storm wins with 3,216
  points; Rush AI is third with 2,481 points and 46 orders delivered.

To make this for another town, follow [OTHER-CITIES.md](OTHER-CITIES.md) (data scripts in
`tools/build_city.py`).

Switch views with the 2D / 3D buttons (or V, or `?view=3d`).

Elevation: Mapzen Terrarium tiles (AWS Open Data). Map data © OpenStreetMap contributors (ODbL).
