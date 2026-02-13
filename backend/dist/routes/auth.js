"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const config_1 = require("../lib/config");
const auth_1 = require("../middleware/auth");
const mailer_1 = require("../lib/mailer");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.'),
    email: zod_1.z.string().trim().email('Email invalido.'),
    password: zod_1.z.string().min(6, 'Senha deve ter no minimo 6 caracteres.'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Email invalido.'),
    password: zod_1.z.string().min(1, 'Senha obrigatoria.'),
});
const requestLoginTokenSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Email invalido.'),
});
const verifyLoginTokenSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Email invalido.'),
    token: zod_1.z.string().trim().min(4, 'Token invalido.').max(12, 'Token invalido.'),
});
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.'),
    avatarUrl: zod_1.z
        .string()
        .trim()
        .max(3000000, 'Imagem muito grande.')
        .refine((value) => /^data:image\/(png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(value), 'Formato de imagem invalido.')
        .nullable()
        .optional(),
});
const updatePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Senha atual obrigatoria.'),
    newPassword: zod_1.z.string().min(6, 'Nova senha deve ter no minimo 6 caracteres.'),
    confirmPassword: zod_1.z.string().min(6, 'Confirmacao deve ter no minimo 6 caracteres.'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Confirmacao de senha diferente.',
});
const buildToken = (userId) => jsonwebtoken_1.default.sign({}, config_1.config.jwtSecret, {
    subject: userId,
    expiresIn: '7d',
});
const generateNumericCode = (length) => {
    const bytes = crypto_1.default.randomBytes(length);
    let result = '';
    for (let index = 0; index < length; index += 1) {
        result += String(bytes[index] % 10);
    }
    return result;
};
const hashToken = (token) => crypto_1.default.createHash('sha256').update(token).digest('hex');
router.post('/register', async (request, response) => {
    const body = registerSchema.parse(request.body);
    const email = body.email.toLowerCase();
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return response.status(409).json({ message: 'Email ja cadastrado.' });
    }
    const passwordHash = await bcryptjs_1.default.hash(body.password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name: body.name.trim(),
            email,
            passwordHash,
            categories: {
                create: [{ name: 'Outros', isSystem: true }],
            },
        },
    });
    const token = buildToken(user.id);
    return response.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    });
});
router.post('/login', async (request, response) => {
    const body = loginSchema.parse(request.body);
    const email = body.email.toLowerCase();
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return response.status(401).json({ message: 'Credenciais invalidas.' });
    }
    const passwordMatch = await bcryptjs_1.default.compare(body.password, user.passwordHash);
    if (!passwordMatch) {
        return response.status(401).json({ message: 'Credenciais invalidas.' });
    }
    const token = buildToken(user.id);
    return response.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    });
});
router.post('/login-token/request', async (request, response) => {
    const body = requestLoginTokenSchema.parse(request.body);
    const email = body.email.toLowerCase();
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
    });
    if (!user) {
        return response.json({
            message: 'Se o email estiver cadastrado, enviaremos um token de acesso.',
        });
    }
    const rawToken = generateNumericCode(config_1.config.loginTokenLength);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + config_1.config.loginTokenTtlMinutes * 60000);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.loginToken.deleteMany({
            where: { userId: user.id, usedAt: null },
        }),
        prisma_1.prisma.loginToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        }),
    ]);
    const emailSent = await (0, mailer_1.sendLoginTokenEmail)({
        to: user.email,
        token: rawToken,
        expiresInMinutes: config_1.config.loginTokenTtlMinutes,
    });
    if (!emailSent) {
        // eslint-disable-next-line no-console
        console.log(`[login-token] ${user.email} => ${rawToken}`);
    }
    return response.json({
        message: 'Token enviado para o email cadastrado.',
        ...(config_1.config.nodeEnv !== 'production' && config_1.config.loginTokenDevExpose ? { devToken: rawToken } : {}),
    });
});
router.post('/login-token/verify', async (request, response) => {
    const body = verifyLoginTokenSchema.parse(request.body);
    const email = body.email.toLowerCase();
    const providedHash = hashToken(body.token);
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, avatarUrl: true },
    });
    if (!user) {
        return response.status(401).json({ message: 'Token invalido ou expirado.' });
    }
    const record = await prisma_1.prisma.loginToken.findFirst({
        where: {
            userId: user.id,
            tokenHash: providedHash,
            usedAt: null,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });
    if (!record) {
        return response.status(401).json({ message: 'Token invalido ou expirado.' });
    }
    await prisma_1.prisma.loginToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
    });
    const token = buildToken(user.id);
    return response.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    });
});
router.get('/me', auth_1.auth, async (request, response) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: request.userId },
        select: { id: true, name: true, email: true, avatarUrl: true },
    });
    if (!user) {
        return response.status(404).json({ message: 'Usuario nao encontrado.' });
    }
    return response.json(user);
});
router.patch('/profile', auth_1.auth, async (request, response) => {
    const body = updateProfileSchema.parse(request.body);
    const updated = await prisma_1.prisma.user.update({
        where: { id: request.userId },
        data: {
            name: body.name.trim(),
            avatarUrl: body.avatarUrl ? body.avatarUrl.trim() : null,
        },
        select: { id: true, name: true, email: true, avatarUrl: true },
    });
    return response.json(updated);
});
router.patch('/password', auth_1.auth, async (request, response) => {
    const body = updatePasswordSchema.parse(request.body);
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: request.userId },
        select: { id: true, passwordHash: true },
    });
    if (!user) {
        return response.status(404).json({ message: 'Usuario nao encontrado.' });
    }
    const matchesCurrent = await bcryptjs_1.default.compare(body.currentPassword, user.passwordHash);
    if (!matchesCurrent) {
        return response.status(401).json({ message: 'Senha atual incorreta.' });
    }
    const samePassword = await bcryptjs_1.default.compare(body.newPassword, user.passwordHash);
    if (samePassword) {
        return response.status(400).json({ message: 'Nova senha deve ser diferente da atual.' });
    }
    const newHash = await bcryptjs_1.default.hash(body.newPassword, 10);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
    });
    return response.json({ message: 'Senha atualizada com sucesso.' });
});
exports.default = router;
