import 'dotenv/config'

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback
  return value === 'true' || value === '1'
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 3333),
  jwtSecret: process.env.JWT_SECRET || 'change-this-jwt-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  loginTokenTtlMinutes: toNumber(process.env.LOGIN_TOKEN_TTL_MINUTES, 10),
  loginTokenLength: toNumber(process.env.LOGIN_TOKEN_LENGTH, 6),
  loginTokenDevExpose: toBoolean(process.env.LOGIN_TOKEN_DEV_EXPOSE, true),
  smtp: {
    host: process.env.SMTP_HOST,
    port: toNumber(process.env.SMTP_PORT, 587),
    secure: toBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
}
