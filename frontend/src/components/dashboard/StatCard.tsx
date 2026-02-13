import { ArrowUpRight } from 'lucide-react'
import type { StatItem } from '../../types/dashboard'

export default function StatCard({ stat }: { stat: StatItem }) {
  return (
    <article
      className={`rounded-3xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        stat.highlight
          ? 'border-[var(--accent-strong)] bg-[linear-gradient(150deg,#0f6e3e,#2cae6b)] text-white'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className={`text-lg font-medium ${stat.highlight ? 'text-white' : 'text-[var(--text-primary)]'}`}>{stat.title}</p>
        <span className={`rounded-full p-2 ${stat.highlight ? 'bg-white/20' : 'border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)]'}`}>
          <ArrowUpRight size={14} />
        </span>
      </div>
      <p className="text-4xl font-semibold leading-none">{stat.value}</p>
      <p className={`mt-3 text-xs ${stat.highlight ? 'text-[#d5f6e3]' : 'text-[var(--text-muted)]'}`}>{stat.trend}</p>
    </article>
  )
}
