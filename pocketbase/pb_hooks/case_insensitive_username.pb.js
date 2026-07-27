onRecordAuthWithPasswordRequest((event) => {
    if (!event.record && event.identityField === "username") {
        const matches = event.app.findRecordsByFilter(
            event.collection,
            "username:lower = {:username}",
            "",
            1,
            0,
            { username: event.identity.toLowerCase() },
        );

        if (matches.length > 0) {
            event.record = matches[0];
        }
    }

    event.next();
}, "users");
