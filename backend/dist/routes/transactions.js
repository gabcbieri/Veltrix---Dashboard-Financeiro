"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const transactionSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2, 'Descricao deve ter ao menos 2 caracteres.'),
    amount: zod_1.z.number().positive('Valor deve ser maior que zero.'),
    type: zod_1.z.enum(['income', 'expense']),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data invalida.'),
    categoryId: zod_1.z.string().cuid('Categoria invalida.'),
});
const parseDate = (value) => new Date(`${value}T00:00:00.000Z`);
const formatDate = (value) => value.toISOString().slice(0, 10);
router.get('/', async (request, response) => {
    const query = zod_1.z
        .object({
        month: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}$/)
            .optional(),
    })
        .parse(request.query);
    let dateFilter;
    if (query.month) {
        const [year, month] = query.month.split('-').map(Number);
        const start = new Date(Date.UTC(year, month - 1, 1));
        const end = new Date(Date.UTC(year, month, 1));
        dateFilter = { gte: start, lt: end };
    }
    const transactions = await prisma_1.prisma.transaction.findMany({
        where: {
            userId: request.userId,
            date: dateFilter,
        },
        include: {
            category: {
                select: { id: true, name: true },
            },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    return response.json(transactions.map((item) => ({
        ...item,
        date: formatDate(item.date),
    })));
});
router.post('/', async (request, response) => {
    const body = transactionSchema.parse(request.body);
    const category = await prisma_1.prisma.category.findFirst({
        where: { id: body.categoryId, userId: request.userId },
        select: { id: true, name: true },
    });
    if (!category) {
        return response.status(404).json({ message: 'Categoria nao encontrada.' });
    }
    const transaction = await prisma_1.prisma.transaction.create({
        data: {
            title: body.title,
            amount: body.amount,
            type: body.type,
            date: parseDate(body.date),
            categoryId: category.id,
            userId: request.userId,
        },
        include: {
            category: {
                select: { id: true, name: true },
            },
        },
    });
    return response.status(201).json({
        ...transaction,
        date: formatDate(transaction.date),
    });
});
router.patch('/:id', async (request, response) => {
    const params = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(request.params);
    const body = transactionSchema.parse(request.body);
    const existing = await prisma_1.prisma.transaction.findFirst({
        where: { id: params.id, userId: request.userId },
        select: { id: true },
    });
    if (!existing) {
        return response.status(404).json({ message: 'Lancamento nao encontrado.' });
    }
    const category = await prisma_1.prisma.category.findFirst({
        where: { id: body.categoryId, userId: request.userId },
        select: { id: true },
    });
    if (!category) {
        return response.status(404).json({ message: 'Categoria nao encontrada.' });
    }
    const transaction = await prisma_1.prisma.transaction.update({
        where: { id: existing.id },
        data: {
            title: body.title,
            amount: body.amount,
            type: body.type,
            date: parseDate(body.date),
            categoryId: category.id,
        },
        include: {
            category: {
                select: { id: true, name: true },
            },
        },
    });
    return response.json({
        ...transaction,
        date: formatDate(transaction.date),
    });
});
router.delete('/:id', async (request, response) => {
    const params = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(request.params);
    const existing = await prisma_1.prisma.transaction.findFirst({
        where: { id: params.id, userId: request.userId },
        select: { id: true },
    });
    if (!existing) {
        return response.status(404).json({ message: 'Lancamento nao encontrado.' });
    }
    await prisma_1.prisma.transaction.delete({ where: { id: existing.id } });
    return response.status(204).send();
});
exports.default = router;
