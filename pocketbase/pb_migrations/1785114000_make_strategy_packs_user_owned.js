migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const packs = app.findCollectionByNameOrId("strategy_packs");
    const ranges = app.findCollectionByNameOrId("preflop_ranges");

    packs.fields.add(
      new RelationField({
        name: "owner",
        collectionId: users.id,
        maxSelect: 1,
        cascadeDelete: true,
      }),
    );
    packs.listRule = "owner = @request.auth.id";
    packs.viewRule = "owner = @request.auth.id";
    packs.createRule =
      '@request.auth.id != "" && @request.body.owner = @request.auth.id';
    packs.updateRule =
      "owner = @request.auth.id && @request.body.owner:changed = false";
    packs.deleteRule = "owner = @request.auth.id";
    packs.indexes = [
      "CREATE UNIQUE INDEX idx_strategy_pack_owner ON strategy_packs (owner) WHERE owner != ''",
    ];
    app.save(packs);

    ranges.listRule = "pack.owner = @request.auth.id";
    ranges.viewRule = "pack.owner = @request.auth.id";
    ranges.createRule =
      '@request.auth.id != "" && pack.owner = @request.auth.id';
    ranges.updateRule =
      "pack.owner = @request.auth.id && @request.body.pack:changed = false";
    ranges.deleteRule = "pack.owner = @request.auth.id";
    app.save(ranges);
  },
  (app) => {
    const packs = app.findCollectionByNameOrId("strategy_packs");
    const ranges = app.findCollectionByNameOrId("preflop_ranges");

    ranges.listRule = '@request.auth.id != ""';
    ranges.viewRule = '@request.auth.id != ""';
    ranges.createRule = '@request.auth.id != "" && @request.auth.admin = true';
    ranges.updateRule = '@request.auth.id != "" && @request.auth.admin = true';
    ranges.deleteRule = '@request.auth.id != "" && @request.auth.admin = true';
    app.save(ranges);

    packs.fields.removeByName("owner");
    packs.listRule = '@request.auth.id != ""';
    packs.viewRule = '@request.auth.id != ""';
    packs.createRule = '@request.auth.id != "" && @request.auth.admin = true';
    packs.updateRule = '@request.auth.id != "" && @request.auth.admin = true';
    packs.deleteRule = '@request.auth.id != "" && @request.auth.admin = true';
    packs.indexes = [
      "CREATE UNIQUE INDEX idx_strategy_pack_name_version ON strategy_packs (name, version)",
    ];
    app.save(packs);
  },
);
