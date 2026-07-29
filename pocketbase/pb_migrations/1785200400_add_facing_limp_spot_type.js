migrate(
  (app) => {
    const ranges = app.findCollectionByNameOrId("preflop_ranges");
    const spotType = ranges.fields.getByName("spot_type");
    spotType.values = [
      "Open",
      "Facing open",
      "Facing limp",
      "Facing 3-bet",
      "Facing 4-bet",
    ];
    app.save(ranges);
  },
  (app) => {
    app
      .db()
      .newQuery("DELETE FROM preflop_ranges WHERE spot_type = 'Facing limp'")
      .execute();

    const ranges = app.findCollectionByNameOrId("preflop_ranges");
    const spotType = ranges.fields.getByName("spot_type");
    spotType.values = ["Open", "Facing open", "Facing 3-bet", "Facing 4-bet"];
    app.save(ranges);
  },
);
