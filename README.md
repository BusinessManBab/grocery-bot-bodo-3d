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
- Sea, lakes and the harbour: the sea is clamped flat and still, with no current streaks;
  water areas get current only when they are inland streams big enough to flow.
- Bridges: road-over-water crossings (1 on this map) get a raised deck, railings and piers;
  trucks drive over them.
- 10 place labels, looked up in OSM: Bodø domkirke, Bodø sentrum, Bodø stasjon,
  Hurtigruteterminalen, Bodø lufthavn, Luftfartsmuseet, Bodø Spektrum, Rønvik, Bodøsjøen
  and Bodø havn.
- 10,221 trees in the parks, woods and open land (forest step 11, cap 22,000); no trees in water.
- Shop window (bottom right): the v1 grocerybot.no store animation (Erik's `arena.js`, ported
  to `src/shop-iso.js`) showing the robots and trucks inside a shop as the match plays, switched
  by clicking any shop; order card (left) when you click an order house.
  - The shop floor is laid out by department, not round-robin: dairy fridges at the back,
    cheese/eggs/juice beside them, breakfast and baking shelves, pantry shelves, produce bins
    and the bakery rack together, with a sign over every section. The recorded match really
    picks milk from the dairy fridges (`tools/simulate_match.py`).
  - The trucks in the bays are the player's own map trucks: `looks.js` `truckArt(look)`, with
    the same carriage, cab, visor, decal, colour and expression as the trucks driving that
    player's routes, plus the rear loading door, cargo and order tag.
- The replay is a simulated 5-seat, 600-tick match with the user's rush-ai, recorded from the
  engine on the Bodø map (`tools/simulate_match.py ... 7 bodo`),
  finished with 66 orders delivered by Rush AI.

To make this for another town, follow [OTHER-CITIES.md](OTHER-CITIES.md) (data scripts in
`tools/build_city.py`).

Switch views with the 2D / 3D buttons (or V, or `?view=3d`).

Elevation: Mapzen Terrarium tiles (AWS Open Data). Map data © OpenStreetMap contributors (ODbL).
