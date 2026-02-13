"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.'),
});
const updateSchema = createSchema;
router.get('/', async (request, response) => {
    const categories = await prisma_1.prisma.category.findMany({
        where: { userId: request.userId },
        orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
    return response.json(categories);
});
router.post('/', async (request, response) => {
    const body = createSchema.parse(request.body);
    const category = await prisma_1.prisma.category.create({
        data: {
            name: body.name,
            userId: request.userId,
        },
    });
    return response.status(201).json(category);
});
router.patch('/:id', async (request, response) => {
    const params = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(request.params);
    const body = updateSchema.parse(request.body);
    const category = await prisma_1.prisma.category.findFirst({
        where: { id: params.id, userId: request.userId },
    });
    if (!category) {
        return response.status(404).json({ message: 'Categoria nao encontrada.' });
    }
    const updated = await prisma_1.prisma.category.update({
        where: { id: category.id },
        data: { name: body.name },
    });
    return response.json(updated);
});
router.delete('/:id', async (request, response) => {
    const params = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(request.params);
    const category = await prisma_1.prisma.category.findFirst({
        where: { id: params.id, userId: request.userId },
    });
    if (!category) {
        return response.status(404).json({ message: 'Categoria nao encontrada.' });
    }
    if (category.isSystem) {
        return response.status(400).json({ message: 'Categoria padrao nao pode ser removida.' });
    }
    const fallback = await prisma_1.prisma.category.findFirst({
        where: { userId: request.userId, isSystem: true },
        select: { id: true },
    });
    if (!fallback) {
        return response.status(500).json({ message: 'Categoria padrao nao encontrada para migracao.' });
    }
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.transaction.updateMany({
            where: { userId: request.userId, categoryId: category.id },
            data: { categoryId: fallback.id },
        }),
        prisma_1.prisma.category.delete({ where: { id: category.id } }),
    ]);
    return response.status(204).send();
});
exports.default = router;
