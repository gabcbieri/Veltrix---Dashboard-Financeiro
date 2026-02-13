import { cn } from '../../utils'

export default function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-strong)] focus:outline-none',
        className
      )}
      {...rest}
    />
  )
}
