import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import type { User } from '../../types/finance'
import Sidebar from '../dashboard/Sidebar'

export default function AppLayout({ onLogout, user }: { onLogout: () => void; user: User | null }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-screen w-[270px] lg:block">
          <Sidebar onLogout={onLogout} user={user} />
        </aside>

        <main className="min-h-screen flex-1 p-4 md:p-5">
          <div className="mb-3 lg:hidden">
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <Menu size={16} />
              Menu
            </button>
          </div>
          <Outlet />
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 lg:hidden">
          <div className="h-full w-72 bg-transparent">
            <Sidebar
              onClose={() => setDrawerOpen(false)}
              onLogout={() => {
                setDrawerOpen(false)
                onLogout()
              }}
              user={user}
            />
          </div>
          <button
            className="absolute inset-0 -z-10 cursor-default"
            onClick={() => setDrawerOpen(false)}
            type="button"
          />
        </div>
      )}
    </div>
  )
}
