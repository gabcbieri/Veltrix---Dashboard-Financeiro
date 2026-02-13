import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { loginRequest } from '../services/auth'
import { BRAND_NAME, BRAND_SLOGAN } from '../constants/brand'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: { email?: string; password?: string } = {}
    if (!email.trim()) nextErrors.email = 'Informe seu e-mail.'
    if (!password.trim()) nextErrors.password = 'Informe sua senha.'
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    setErrorMessage(null)

    try {
      await loginRequest({ email, password })
      setShowWelcome(true)
      window.setTimeout(() => {
        onLogin()
        navigate('/', { replace: true })
      }, 1600)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message ?? 'Nao foi possivel fazer login.')
      } else {
        setErrorMessage('Nao foi possivel fazer login.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper/85 px-6 backdrop-blur-sm">
          <div className="welcome-pop rounded-3xl border border-copper-300/50 bg-earth-900/95 px-8 py-10 text-center shadow-glow">
            <p className="text-sm uppercase tracking-[0.25em] text-earth-300">Login realizado</p>
            <h3 className="mt-3 text-3xl font-semibold text-wine-50">Bem-vindo ao {BRAND_NAME}</h3>
            <p className="mt-2 text-sm text-copper-200">{BRAND_SLOGAN}</p>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-semibold text-wine-50">Entrar</h2>
        <p className="text-sm text-earth-300">{BRAND_SLOGAN}.</p>
      </div>
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div>
          <Input
            aria-invalid={Boolean(fieldErrors.email)}
            className={fieldErrors.email ? 'border-[var(--danger)] focus:border-[var(--danger)]' : ''}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setFieldErrors((current) => ({ ...current, email: undefined }))
            }}
            required
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.email}</p>}
        </div>
        <div>
          <Input
            aria-invalid={Boolean(fieldErrors.password)}
            className={fieldErrors.password ? 'border-[var(--danger)] focus:border-[var(--danger)]' : ''}
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setFieldErrors((current) => ({ ...current, password: undefined }))
            }}
            required
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.password}</p>}
        </div>
        {errorMessage && <p className="text-xs text-red-300">{errorMessage}</p>}
        <Button className="w-full bg-copper-400 text-earth-950 hover:bg-copper-300 disabled:opacity-60" type="submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="text-xs text-earth-300">
        Nao tem conta?{' '}
        <Link className="text-copper-200 hover:text-copper-300" to="/register">
          Crie agora
        </Link>
        .
      </p>
    </div>
  )
}
