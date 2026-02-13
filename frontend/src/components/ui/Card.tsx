import { cn } from '../../utils'

export default function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm', className)}>
      {children}
    </div>
  )
}
