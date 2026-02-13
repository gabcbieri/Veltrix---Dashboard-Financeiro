import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { registerRequest } from '../services/auth'
import { BRAND_NAME, BRAND_SLOGAN } from '../constants/brand'

export default function Register({ onRegister }: { onRegister: () => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: { name?: string; email?: string; password?: string } = {}
    if (!name.trim()) nextErrors.name = 'Informe seu nome.'
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
      await registerRequest({ name, email, password })
      onRegister()
      navigate('/', { replace: true })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message ?? 'Nao foi possivel concluir o cadastro.')
      } else {
        setErrorMessage('Nao foi possivel concluir o cadastro.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-wine-50">Criar conta</h2>
        <p className="text-sm text-earth-300">
          {BRAND_NAME}: {BRAND_SLOGAN}.
        </p>
      </div>
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div>
          <Input
            aria-invalid={Boolean(fieldErrors.name)}
            className={fieldErrors.name ? 'border-[var(--danger)] focus:border-[var(--danger)]' : ''}
            placeholder="Nome ou apelido"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setFieldErrors((current) => ({ ...current, name: undefined }))
            }}
            required
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.name}</p>}
        </div>
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
          {submitting ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
      <p className="text-xs text-earth-300">
        Ja possui conta?{' '}
        <Link className="text-copper-200 hover:text-copper-300" to="/login">
          Faca login
        </Link>
        .
      </p>
    </div>
  )
}
