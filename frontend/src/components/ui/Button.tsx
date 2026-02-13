import { cn } from '../../utils'

export default function Button({ className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'rounded-xl bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
