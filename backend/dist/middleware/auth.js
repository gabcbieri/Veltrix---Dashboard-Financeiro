"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../lib/config");
const auth = (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ message: 'Token ausente.' });
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        request.userId = payload.sub;
        return next();
    }
    catch {
        return response.status(401).json({ message: 'Token invalido.' });
    }
};
exports.auth = auth;
