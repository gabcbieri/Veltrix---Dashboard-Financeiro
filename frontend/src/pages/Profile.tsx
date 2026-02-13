import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import axios from 'axios'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import type { User } from '../types/finance'

type ProfileProps = {
  user: User
  onUpdateProfile: (payload: { name: string; avatarUrl?: string | null }) => Promise<void>
  onUpdatePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message
  }
  return fallback
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

const MAX_AVATAR_SIDE = 1280
const MAX_AVATAR_BYTES = 1_500_000
const MIN_QUALITY = 0.4
const QUALITY_STEP = 0.1

const estimateDataUrlBytes = (value: string) => {
  const base64 = value.split(',')[1] ?? ''
  return Math.ceil((base64.length * 3) / 4)
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Falha ao carregar a imagem.'))
    image.src = src
  })

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Falha ao ler a imagem.'))
        return
      }
      resolve(reader.result)
    }
    reader.onerror = () => reject(new Error('Falha ao ler a imagem.'))
    reader.readAsDataURL(file)
  })

const buildAvatarDataUrl = async (file: File) => {
  const fileDataUrl = await fileToDataUrl(file)
  const image = await loadImage(fileDataUrl)

  const scale = Math.min(1, MAX_AVATAR_SIDE / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Nao foi possivel processar a imagem.')

  context.drawImage(image, 0, 0, width, height)

  let mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  let quality = 0.9
  let output = canvas.toDataURL(mime, quality)

  while (estimateDataUrlBytes(output) > MAX_AVATAR_BYTES && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, Number((quality - QUALITY_STEP).toFixed(2)))
    output = canvas.toDataURL(mime, quality)
  }

  if (estimateDataUrlBytes(output) > MAX_AVATAR_BYTES && mime !== 'image/jpeg') {
    mime = 'image/jpeg'
    quality = 0.82
    output = canvas.toDataURL(mime, quality)
    while (estimateDataUrlBytes(output) > MAX_AVATAR_BYTES && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, Number((quality - QUALITY_STEP).toFixed(2)))
      output = canvas.toDataURL(mime, quality)
    }
  }

  return output
}

export default function Profile({ user, onUpdateProfile, onUpdatePassword }: ProfileProps) {
  const [name, setName] = useState(user.name)
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl ?? '')
  const [avatarValue, setAvatarValue] = useState<string | null>(user.avatarUrl ?? null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [profileFieldError, setProfileFieldError] = useState<string | null>(null)
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    setName(user.name)
    setAvatarPreview(user.avatarUrl ?? '')
    setAvatarValue(user.avatarUrl ?? null)
  }, [user.avatarUrl, user.name])

  const initials = useMemo(() => getInitials(name || user.name), [name, user.name])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileError('Selecione um arquivo de imagem valido.')
      return
    }

    void (async () => {
      try {
        const avatarData = await buildAvatarDataUrl(file)
        setAvatarPreview(avatarData)
        setAvatarValue(avatarData)
        setProfileError(null)
      } catch {
        setProfileError('Nao foi possivel processar essa imagem.')
      } finally {
        input.value = ''
      }
    })()
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview('')
    setAvatarValue(null)
    setProfileError(null)
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setProfileFieldError('Informe seu nome.')
      return
    }

    setProfileFieldError(null)
    setProfileError(null)
    setProfileSubmitting(true)
    try {
      await onUpdateProfile({
        name: name.trim(),
        avatarUrl: avatarValue,
      })
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Nao foi possivel atualizar o perfil.'))
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {}
    if (!currentPassword.trim()) nextErrors.currentPassword = 'Informe a senha atual.'
    if (!newPassword.trim()) nextErrors.newPassword = 'Informe a nova senha.'
    if (!confirmPassword.trim()) nextErrors.confirmPassword = 'Confirme a nova senha.'
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'As senhas nao conferem.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setPasswordFieldErrors(nextErrors)
      return
    }

    setPasswordFieldErrors({})
    setPasswordError(null)
    setPasswordSubmitting(true)
    try {
      await onUpdatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError(getErrorMessage(error, 'Nao foi possivel atualizar a senha.'))
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Perfil</h1>
        <p className="text-xs text-[var(--text-muted)]">Mantenha seus dados pessoais e seguranca da conta em dia.</p>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Foto de perfil" className="h-16 w-16 rounded-2xl border border-[var(--border)] object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] text-lg font-semibold text-[var(--text-primary)]">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
          </div>
        </div>

        <form className="space-y-4" noValidate onSubmit={handleProfileSubmit}>
          <div>
            <Input
              aria-invalid={Boolean(profileFieldError)}
              className={profileFieldError ? 'border-[var(--danger)] focus:border-[var(--danger)]' : ''}
              placeholder="Nome ou apelido"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setProfileFieldError(null)
              }}
              required
            />
            {profileFieldError && <p className="mt-1 text-xs text-[var(--danger)]">{profileFieldError}</p>}
          </div>
          <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
            <p className="text-xs text-[var(--text-muted)]">Foto de perfil</p>
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)] transition hover:opacity-90">
              Escolher imagem
              <input accept="image/*" className="hidden" type="file" onChange={handleAvatarChange} />
            </label>
            {avatarPreview && (
              <button
                className="ml-2 rounded-lg border border-[var(--danger)] px-3 py-2 text-xs text-[var(--danger)] transition hover:bg-[var(--danger)]/10"
                onClick={handleRemoveAvatar}
                type="button"
              >
                Remover foto
              </button>
            )}
            <p className="text-[11px] text-[var(--text-muted)]">Aceita qualquer tamanho. A imagem e ajustada automaticamente para salvar.</p>
          </div>
          {profileError && <p className="text-xs text-[var(--danger)]">{profileError}</p>}
          <Button className="disabled:opacity-60" disabled={profileSubmitting} type="submit">
            {profileSubmitting ? 'Salvando perfil...' : 'Salvar perfil'}
          </Button>
        </form>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Trocar senha</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Use uma senha nova para proteger sua conta.</p>
        <form className="mt-4 space-y-4" noValidate onSubmit={handlePasswordSubmit}>
          <div>
            <Input
              aria-invalid={Boolean(passwordFieldErrors.currentPassword)}
              className={passwordFieldErrors.currentPassword ? 'border-[var(--danger)] focus:border-[var(--danger)]' : ''}
              placeholder="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value)
                setPasswordFieldErrors((current) => ({ ...current, currentPassword: undefined }))
              }}
              required
            />
            {passwordFieldErrors.currentPassword && (
              <p className="mt-1 text-xs text-[var(--danger)]">{passwordFieldErrors.currentPassword}</p>
            )}
          </div>
          <div>
            <Input
              aria-invalid={Boolean(passwordFieldErrors.newPassword)}
              className={passwordFieldErrors.newPassword ? 'border-[var(--danger)] focus:border-[var(--danger)]' : ''}
              placeholder="Nova senha"
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value)
                setPasswordFieldErrors((current) => ({ ...current, newPassword: undefined }))
              }}
              required
            />
            {passwordFieldErrors.newPassword && <p className="mt-1 text-xs text-[var(--danger)]">{passwordFieldErrors.newPassword}</p>}
          </div>
          <div>
            <Input
              aria-invalid={Boolean(passwordFieldErrors.confirmPassword)}
              className={passwordFieldErrors.confirmPassword ? 'border-[var(--danger)] focus:border-[var(--danger)]' : ''}
              placeholder="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setPasswordFieldErrors((current) => ({ ...current, confirmPassword: undefined }))
              }}
              required
            />
            {passwordFieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-[var(--danger)]">{passwordFieldErrors.confirmPassword}</p>
            )}
          </div>
          {passwordError && <p className="text-xs text-[var(--danger)]">{passwordError}</p>}
          <Button className="disabled:opacity-60" disabled={passwordSubmitting} type="submit">
            {passwordSubmitting ? 'Atualizando senha...' : 'Atualizar senha'}
          </Button>
        </form>
      </section>
    </div>
  )
}
