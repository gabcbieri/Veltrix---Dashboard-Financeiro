"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const auth_2 = require("./middleware/auth");
const errorHandler_1 = require("./middleware/errorHandler");
const config_1 = require("./lib/config");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin: config_1.config.frontendUrl,
}));
exports.app.use((0, morgan_1.default)('dev'));
exports.app.use(express_1.default.json({ limit: '50mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
exports.app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
});
exports.app.use('/api/auth', auth_1.default);
exports.app.use('/api/categories', auth_2.auth, categories_1.default);
exports.app.use('/api/transactions', auth_2.auth, transactions_1.default);
exports.app.use('/api', auth_2.auth, dashboard_1.default);
exports.app.use(errorHandler_1.errorHandler);
