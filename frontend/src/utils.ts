import clsx from 'clsx'

export const cn = (...values: Array<string | undefined | false>) => clsx(values)

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export const formatDateBr = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T12:00:00`))

export const formatMonthLabel = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${value}-01T12:00:00`))
