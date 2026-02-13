"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./lib/config");
app_1.app.listen(config_1.config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${config_1.config.port}`);
});
