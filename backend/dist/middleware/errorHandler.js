"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (error, _request, response, _next) => {
    if (error instanceof zod_1.ZodError) {
        return response.status(400).json({
            message: 'Dados invalidos.',
            issues: error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = String(error.code);
        if (code === 'P2002') {
            return response.status(409).json({ message: 'Registro duplicado.' });
        }
        if (code === 'P2025') {
            return response.status(404).json({ message: 'Registro nao encontrado.' });
        }
    }
    if (error instanceof Error) {
        return response.status(500).json({ message: error.message });
    }
    return response.status(500).json({ message: 'Erro interno.' });
};
exports.errorHandler = errorHandler;
