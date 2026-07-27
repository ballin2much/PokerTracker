migrate(
  (app) => {
    const adminRule = '@request.auth.id != "" && @request.auth.admin = true';
    const authenticatedRule = '@request.auth.id != ""';

    const packs = new Collection({
      type: "base",
      name: "strategy_packs",
      listRule: authenticatedRule,
      viewRule: authenticatedRule,
      createRule: adminRule,
      updateRule: adminRule,
      deleteRule: adminRule,
      fields: [
        { name: "name", type: "text", required: true, max: 120 },
        { name: "version", type: "number", required: true, min: 1 },
        { name: "description", type: "text", max: 1000 },
        { name: "published", type: "bool" },
        { name: "configuration", type: "json", required: true, maxSize: 20000 },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_strategy_pack_name_version ON strategy_packs (name, version)",
      ],
    });
    app.save(packs);

    const ranges = new Collection({
      type: "base",
      name: "preflop_ranges",
      listRule: authenticatedRule,
      viewRule: authenticatedRule,
      createRule: adminRule,
      updateRule: adminRule,
      deleteRule: adminRule,
      fields: [
        {
          name: "pack",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: packs.id,
          cascadeDelete: true,
        },
        { name: "spot_key", type: "text", required: true, max: 100 },
        { name: "label", type: "text", required: true, max: 160 },
        {
          name: "spot_type",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["Open", "Facing open", "Facing 3-bet", "Facing 4-bet"],
        },
        {
          name: "hero",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["UTG", "HJ", "CO", "BTN", "SB", "BB"],
        },
        {
          name: "villain",
          type: "select",
          maxSelect: 1,
          values: ["UTG", "HJ", "CO", "BTN", "SB", "BB"],
        },
        { name: "pot", type: "text", required: true, max: 300 },
        { name: "raise_label", type: "text", required: true, max: 100 },
        { name: "actions", type: "json", required: true, maxSize: 100000 },
        { name: "enabled", type: "bool" },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_preflop_range_pack_spot ON preflop_ranges (pack, spot_key)",
      ],
    });
    app.save(ranges);
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId("preflop_ranges"));
    } catch {
      // Already removed.
    }
    try {
      app.delete(app.findCollectionByNameOrId("strategy_packs"));
    } catch {
      // Already removed.
    }
  },
);
