import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import type { User } from '../types/finance'
import type { AppPreferences } from '../types/preferences'

type SettingsProps = {
  user: User | null
  preferences: AppPreferences
  onThemeChange: (theme: AppPreferences['theme']) => void
  onSavePreferences: (preferences: AppPreferences) => void
  onResetPreferences: () => void
}

export default function Settings({ user, preferences, onThemeChange, onSavePreferences, onResetPreferences }: SettingsProps) {
  const [form, setForm] = useState<AppPreferences>(preferences)

  useEffect(() => {
    setForm(preferences)
  }, [preferences])

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Configuracoes</h1>
        <p className="text-xs text-[var(--text-muted)]">Gerencie preferencias pessoais e parametros do sistema.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Conta atual</h2>
          <p className="text-sm text-[var(--text-muted)]">Nome: <span className="font-medium text-[var(--text-primary)]">{user?.name ?? 'Nao informado'}</span></p>
          <p className="text-sm text-[var(--text-muted)]">E-mail: <span className="font-medium text-[var(--text-primary)]">{user?.email ?? 'Nao informado'}</span></p>
          <p className="text-sm text-[var(--text-muted)]">Telefone: <span className="font-medium text-[var(--text-primary)]">{form.phone || 'Nao informado'}</span></p>
          <p className="text-sm text-[var(--text-muted)]">Empresa: <span className="font-medium text-[var(--text-primary)]">{form.company || 'Nao informada'}</span></p>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Aparencia e localizacao</h2>
          <div className="space-y-3">
            <label className="block text-xs text-[var(--text-muted)]">
              Tema
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]"
                value={form.theme}
                onChange={(event) => {
                  const theme = event.target.value as AppPreferences['theme']
                  setForm((current) => ({ ...current, theme }))
                  onThemeChange(theme)
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>

            <label className="block text-xs text-[var(--text-muted)]">
              Idioma
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]"
                value={form.language}
                onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
              >
                <option value="pt-BR">Portugues (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Espanol</option>
              </select>
            </label>

            <label className="block text-xs text-[var(--text-muted)]">
              Fuso horario
              <Input value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))} />
            </label>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Preferencias financeiras</h2>
          <div className="space-y-3">
            <label className="block text-xs text-[var(--text-muted)]">
              Moeda
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]"
                value={form.currency}
                onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
              >
                <option value="BRL">Real (BRL)</option>
                <option value="USD">Dolar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Meta mensal (R$)
              <Input
                min="0"
                step="0.01"
                type="number"
                value={form.monthlyGoal}
                onChange={(event) => setForm((current) => ({ ...current, monthlyGoal: Number(event.target.value || 0) }))}
              />
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Orcamento semanal (R$)
              <Input
                min="0"
                step="0.01"
                type="number"
                value={form.weeklyBudget}
                onChange={(event) => setForm((current) => ({ ...current, weeklyBudget: Number(event.target.value || 0) }))}
              />
            </label>
          </div>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Formato e notificacoes</h2>
          <div className="space-y-3">
            <label className="block text-xs text-[var(--text-muted)]">
              Primeiro dia da semana
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]"
                value={form.firstDayOfWeek}
                onChange={(event) => setForm((current) => ({ ...current, firstDayOfWeek: event.target.value as AppPreferences['firstDayOfWeek'] }))}
              >
                <option value="monday">Segunda-feira</option>
                <option value="sunday">Domingo</option>
              </select>
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Formato de data
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]"
                value={form.dateFormat}
                onChange={(event) => setForm((current) => ({ ...current, dateFormat: event.target.value as AppPreferences['dateFormat'] }))}
              >
                <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                <option value="MM/dd/yyyy">MM/dd/yyyy</option>
              </select>
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]">
              E-mails de notificacao
              <input
                checked={form.emailNotifications}
                type="checkbox"
                onChange={(event) => setForm((current) => ({ ...current, emailNotifications: event.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]">
              Notificacoes push
              <input
                checked={form.pushNotifications}
                type="checkbox"
                onChange={(event) => setForm((current) => ({ ...current, pushNotifications: event.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]">
              Modo compacto
              <input
                checked={form.compactMode}
                type="checkbox"
                onChange={(event) => setForm((current) => ({ ...current, compactMode: event.target.checked }))}
              />
            </label>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Informacoes adicionais</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-xs text-[var(--text-muted)]">
            Telefone de contato
            <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Empresa
            <Input value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} />
          </label>
        </div>
      </section>

      <section className="flex flex-wrap justify-end gap-2">
        <Button className="bg-[var(--surface-muted)] text-[var(--text-primary)]" onClick={onResetPreferences} type="button">
          Restaurar padrao
        </Button>
        <Button onClick={() => onSavePreferences(form)} type="button">
          Salvar configuracoes
        </Button>
      </section>
    </div>
  )
}
