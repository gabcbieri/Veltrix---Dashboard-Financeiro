import { Link, NavLink } from 'react-router-dom'
import { LayoutGrid, ListChecks, CalendarDays, BarChart3, UserCircle2, Settings, LogOut } from 'lucide-react'
import type { User } from '../../types/finance'

type SidebarProps = {
  user: User | null
  onLogout: () => void
  onClose?: () => void
}

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-all duration-200 ${
    isActive
      ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-sm'
      : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]'
  }`

export default function Sidebar({ onLogout, onClose }: SidebarProps) {
  const closeIfNeeded = () => onClose?.()

  return (
    <aside className="flex h-full w-full flex-col rounded-r-3xl border-r border-[var(--border)] bg-[var(--surface-soft)] p-5 transition-colors duration-200">
      <Link className="mb-8 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]" onClick={closeIfNeeded} to="/">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent-strong)]">V</span>
        Veltrix
      </Link>

      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">Menu</p>
      <nav className="space-y-1.5">
        <NavLink className={itemClass} onClick={closeIfNeeded} to="/">
          <LayoutGrid size={17} />
          Dashboard
        </NavLink>
        <NavLink className={itemClass} onClick={closeIfNeeded} to="/transactions">
          <ListChecks size={17} />
          Lancamentos
        </NavLink>
        <NavLink className={itemClass} onClick={closeIfNeeded} to="/categories">
          <CalendarDays size={17} />
          Categorias
        </NavLink>
        <NavLink className={itemClass} onClick={closeIfNeeded} to="/analytics">
          <BarChart3 size={17} />
          Analitico
        </NavLink>
        <NavLink className={itemClass} onClick={closeIfNeeded} to="/profile">
          <UserCircle2 size={17} />
          Perfil
        </NavLink>
      </nav>

      <div className="mt-8 border-t border-[var(--border)] pt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">Geral</p>
        <div className="space-y-1.5">
          <NavLink className={itemClass} onClick={closeIfNeeded} to="/settings">
            <Settings size={17} />
            Configuracoes
          </NavLink>
          <button
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[var(--text-muted)] transition-all duration-200 hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
            onClick={onLogout}
            type="button"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </div>
    </aside>
  )
}
