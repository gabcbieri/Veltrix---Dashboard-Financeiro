import nodemailer from 'nodemailer'
import { config } from './config'

const hasSmtpConfig =
  Boolean(config.smtp.host) &&
  Boolean(config.smtp.user) &&
  Boolean(config.smtp.pass) &&
  Boolean(config.smtp.from)

export const sendLoginTokenEmail = async ({
  to,
  token,
  expiresInMinutes,
}: {
  to: string
  token: string
  expiresInMinutes: number
}) => {
  if (!hasSmtpConfig) {
    return false
  }

  const transport = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  })

  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject: 'Seu codigo de acesso - Dash Finance',
    text: `Seu codigo de acesso e ${token}. Ele expira em ${expiresInMinutes} minutos.`,
    html: `<p>Seu codigo de acesso e <strong>${token}</strong>.</p><p>Ele expira em ${expiresInMinutes} minutos.</p>`,
  })

  return true
}
