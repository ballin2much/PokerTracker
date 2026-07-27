migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    users.indexes.push(
      "CREATE UNIQUE INDEX idx_users_username_lower ON users (LOWER(username))",
    );

    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    users.indexes = users.indexes.filter(
      (index) => !index.includes("idx_users_username_lower"),
    );

    app.save(users);
  },
);
