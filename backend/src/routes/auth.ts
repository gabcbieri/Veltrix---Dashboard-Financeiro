import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { config } from '../lib/config'
import { auth } from '../middleware/auth'
import { sendLoginTokenEmail } from '../lib/mailer'

const router = Router()

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  email: z.string().trim().email('Email invalido.'),
  password: z.string().min(6, 'Senha deve ter no minimo 6 caracteres.'),
})

const loginSchema = z.object({
  email: z.string().trim().email('Email invalido.'),
  password: z.string().min(1, 'Senha obrigatoria.'),
})

const requestLoginTokenSchema = z.object({
  email: z.string().trim().email('Email invalido.'),
})

const verifyLoginTokenSchema = z.object({
  email: z.string().trim().email('Email invalido.'),
  token: z.string().trim().min(4, 'Token invalido.').max(12, 'Token invalido.'),
})

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  avatarUrl: z
    .string()
    .trim()
    .max(3_000_000, 'Imagem muito grande.')
    .refine(
      (value) => /^data:image\/(png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(value),
      'Formato de imagem invalido.'
    )
    .nullable()
    .optional(),
})

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatoria.'),
    newPassword: z.string().min(6, 'Nova senha deve ter no minimo 6 caracteres.'),
    confirmPassword: z.string().min(6, 'Confirmacao deve ter no minimo 6 caracteres.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Confirmacao de senha diferente.',
  })

const buildToken = (userId: string) =>
  jwt.sign({}, config.jwtSecret, {
    subject: userId,
    expiresIn: '7d',
  })

const generateNumericCode = (length: number) => {
  const bytes = crypto.randomBytes(length)
  let result = ''
  for (let index = 0; index < length; index += 1) {
    result += String(bytes[index] % 10)
  }
  return result
}

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')

router.post('/register', async (request, response) => {
  const body = registerSchema.parse(request.body)
  const email = body.email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return response.status(409).json({ message: 'Email ja cadastrado.' })
  }

  const passwordHash = await bcrypt.hash(body.password, 10)
  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email,
      passwordHash,
      categories: {
        create: [{ name: 'Outros', isSystem: true }],
      },
    },
  })

  const token = buildToken(user.id)
  return response.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  })
})

router.post('/login', async (request, response) => {
  const body = loginSchema.parse(request.body)
  const email = body.email.toLowerCase()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return response.status(401).json({ message: 'Credenciais invalidas.' })
  }

  const passwordMatch = await bcrypt.compare(body.password, user.passwordHash)
  if (!passwordMatch) {
    return response.status(401).json({ message: 'Credenciais invalidas.' })
  }

  const token = buildToken(user.id)
  return response.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  })
})

router.post('/login-token/request', async (request, response) => {
  const body = requestLoginTokenSchema.parse(request.body)
  const email = body.email.toLowerCase()

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  })

  if (!user) {
    return response.json({
      message: 'Se o email estiver cadastrado, enviaremos um token de acesso.',
    })
  }

  const rawToken = generateNumericCode(config.loginTokenLength)
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + config.loginTokenTtlMinutes * 60_000)

  await prisma.$transaction([
    prisma.loginToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    }),
    prisma.loginToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    }),
  ])

  const emailSent = await sendLoginTokenEmail({
    to: user.email,
    token: rawToken,
    expiresInMinutes: config.loginTokenTtlMinutes,
  })

  if (!emailSent) {
    // eslint-disable-next-line no-console
    console.log(`[login-token] ${user.email} => ${rawToken}`)
  }

  return response.json({
    message: 'Token enviado para o email cadastrado.',
    ...(config.nodeEnv !== 'production' && config.loginTokenDevExpose ? { devToken: rawToken } : {}),
  })
})

router.post('/login-token/verify', async (request, response) => {
  const body = verifyLoginTokenSchema.parse(request.body)
  const email = body.email.toLowerCase()
  const providedHash = hashToken(body.token)

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })

  if (!user) {
    return response.status(401).json({ message: 'Token invalido ou expirado.' })
  }

  const record = await prisma.loginToken.findFirst({
    where: {
      userId: user.id,
      tokenHash: providedHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!record) {
    return response.status(401).json({ message: 'Token invalido ou expirado.' })
  }

  await prisma.loginToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  const token = buildToken(user.id)
  return response.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  })
})

router.get('/me', auth, async (request, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.userId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })

  if (!user) {
    return response.status(404).json({ message: 'Usuario nao encontrado.' })
  }

  return response.json(user)
})

router.patch('/profile', auth, async (request, response) => {
  const body = updateProfileSchema.parse(request.body)

  const updated = await prisma.user.update({
    where: { id: request.userId },
    data: {
      name: body.name.trim(),
      avatarUrl: body.avatarUrl ? body.avatarUrl.trim() : null,
    },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })

  return response.json(updated)
})

router.patch('/password', auth, async (request, response) => {
  const body = updatePasswordSchema.parse(request.body)

  const user = await prisma.user.findUnique({
    where: { id: request.userId },
    select: { id: true, passwordHash: true },
  })

  if (!user) {
    return response.status(404).json({ message: 'Usuario nao encontrado.' })
  }

  const matchesCurrent = await bcrypt.compare(body.currentPassword, user.passwordHash)
  if (!matchesCurrent) {
    return response.status(401).json({ message: 'Senha atual incorreta.' })
  }

  const samePassword = await bcrypt.compare(body.newPassword, user.passwordHash)
  if (samePassword) {
    return response.status(400).json({ message: 'Nova senha deve ser diferente da atual.' })
  }

  const newHash = await bcrypt.hash(body.newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  })

  return response.json({ message: 'Senha atualizada com sucesso.' })
})

export default router
