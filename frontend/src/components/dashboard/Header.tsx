import { Link } from 'react-router-dom'
import type { User } from '../../types/finance'

type HeaderProps = {
  user: User | null
}

const getInitials = (name?: string) => {
  if (!name) return 'US'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'US'
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="mb-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-colors duration-200">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Painel financeiro</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)]">Indicadores em tempo real para acompanhar sua evolucao.</p>
        </div>

        <Link className="ml-1 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 transition-all duration-200 hover:bg-[var(--surface-muted)]" to="/profile">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Foto de perfil" className="h-9 w-9 rounded-full border border-[var(--border)] object-cover" />
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-strong)]">
              {getInitials(user?.name)}
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name ?? 'Usuario'}</p>
            <p className="text-xs text-[var(--text-muted)]">{user?.email ?? 'usuario@email.com'}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
