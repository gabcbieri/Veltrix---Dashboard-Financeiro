import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

const transactionSchema = z.object({
  title: z.string().trim().min(2, 'Descricao deve ter ao menos 2 caracteres.'),
  amount: z.number().positive('Valor deve ser maior que zero.'),
  type: z.enum(['income', 'expense']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data invalida.'),
  categoryId: z.string().cuid('Categoria invalida.'),
})

const parseDate = (value: string) => new Date(`${value}T00:00:00.000Z`)

const formatDate = (value: Date) => value.toISOString().slice(0, 10)

router.get('/', async (request, response) => {
  const query = z
    .object({
      month: z
        .string()
        .regex(/^\d{4}-\d{2}$/)
        .optional(),
    })
    .parse(request.query)

  let dateFilter: { gte: Date; lt: Date } | undefined
  if (query.month) {
    const [year, month] = query.month.split('-').map(Number)
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end = new Date(Date.UTC(year, month, 1))
    dateFilter = { gte: start, lt: end }
  }

  const transactions = await prisma.transaction.findMany({
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
  })

  return response.json(
    transactions.map((item: any) => ({
      ...item,
      date: formatDate(item.date),
    }))
  )
})

router.post('/', async (request, response) => {
  const body = transactionSchema.parse(request.body)

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, userId: request.userId },
    select: { id: true, name: true },
  })

  if (!category) {
    return response.status(404).json({ message: 'Categoria nao encontrada.' })
  }

  const transaction = await prisma.transaction.create({
    data: {
      title: body.title,
      amount: body.amount,
      type: body.type,
      date: parseDate(body.date),
      categoryId: category.id,
      userId: request.userId!,
    },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  })

  return response.status(201).json({
    ...transaction,
    date: formatDate(transaction.date),
  })
})

router.patch('/:id', async (request, response) => {
  const params = z.object({ id: z.string().cuid() }).parse(request.params)
  const body = transactionSchema.parse(request.body)

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, userId: request.userId },
    select: { id: true },
  })

  if (!existing) {
    return response.status(404).json({ message: 'Lancamento nao encontrado.' })
  }

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, userId: request.userId },
    select: { id: true },
  })

  if (!category) {
    return response.status(404).json({ message: 'Categoria nao encontrada.' })
  }

  const transaction = await prisma.transaction.update({
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
  })

  return response.json({
    ...transaction,
    date: formatDate(transaction.date),
  })
})

router.delete('/:id', async (request, response) => {
  const params = z.object({ id: z.string().cuid() }).parse(request.params)

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, userId: request.userId },
    select: { id: true },
  })

  if (!existing) {
    return response.status(404).json({ message: 'Lancamento nao encontrado.' })
  }

  await prisma.transaction.delete({ where: { id: existing.id } })
  return response.status(204).send()
})

export default router
