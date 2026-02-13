import { useMemo } from 'react'
import type { Category, Transaction } from '../types/finance'
import { formatCurrency } from '../utils'

type AnalyticsProps = {
  categories: Category[]
  transactions: Transaction[]
}

const monthLabel = (iso: string) => iso.slice(5)

export default function Analytics({ categories, transactions }: AnalyticsProps) {
  const porCategoria = categories
    .map((category) => {
      const items = transactions.filter((item) => item.categoryId === category.id)
      const entradas = items.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
      const saidas = items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
      return {
        id: category.id,
        nome: category.name,
        entradas,
        saidas,
        saldo: entradas - saidas,
      }
    })
    .sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo))

  const maiorSaida = [...transactions].filter((item) => item.type === 'expense').sort((a, b) => b.amount - a.amount)[0]
  const maiorEntrada = [...transactions].filter((item) => item.type === 'income').sort((a, b) => b.amount - a.amount)[0]

  const months = useMemo(() => {
    const uniques = Array.from(new Set(transactions.map((item) => item.date.slice(0, 7))))
      .sort()
      .slice(-6)

    if (uniques.length === 0) {
      const now = new Date()
      const fallback = [] as string[]
      for (let index = 5; index >= 0; index -= 1) {
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() - index, 1))
        fallback.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
      }
      return fallback
    }

    return uniques
  }, [transactions])

  const monthSeries = months.map((month) => {
    const items = transactions.filter((item) => item.date.startsWith(month))
    const income = items.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
    const expense = items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
    return { month, income, expense, saldo: income - expense }
  })

  const maxSeries = Math.max(
    1,
    ...monthSeries.map((item) => Math.max(item.income, item.expense, Math.abs(item.saldo)))
  )

  const typeTotals = transactions.reduce(
    (acc, item) => {
      if (item.type === 'income') acc.income += item.amount
      else acc.expense += item.amount
      return acc
    },
    { income: 0, expense: 0 }
  )

  const totalVolume = typeTotals.income + typeTotals.expense
  const incomeRatio = totalVolume === 0 ? 0 : (typeTotals.income / totalVolume) * 100
  const expenseRatio = totalVolume === 0 ? 0 : (typeTotals.expense / totalVolume) * 100

  const dayHourMap = Array.from({ length: 7 }, (_, weekday) =>
    Array.from({ length: 4 }, (_, quarter) => {
      const fromHour = quarter * 6
      const value = transactions
        .filter((item) => new Date(`${item.date}T12:00:00`).getDay() === weekday)
        .reduce((sum, item) => sum + item.amount, 0)
      return { weekday, quarter, fromHour, value }
    })
  ).flat()
  const maxHeat = Math.max(1, ...dayHourMap.map((item) => item.value))

  const categoryPerformance = porCategoria
    .map((item) => ({ ...item, total: item.entradas + item.saidas }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
  const maxCategoryTotal = Math.max(1, ...categoryPerformance.map((item) => item.total))

  const ticketMedio = transactions.length === 0 ? 0 : totalVolume / transactions.length

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Analitico</h1>
        <p className="text-xs text-[var(--text-muted)]">Visao aprofundada para comparar desempenho, categorias e sazonalidade.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">Maior entrada registrada</h2>
          <p className="text-sm text-[var(--text-muted)]">{maiorEntrada ? maiorEntrada.title : 'Sem dados'}</p>
          <p className="text-4xl font-semibold text-[var(--accent-strong)]">{maiorEntrada ? formatCurrency(maiorEntrada.amount) : 'R$ 0,00'}</p>
        </article>
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">Maior saida registrada</h2>
          <p className="text-sm text-[var(--text-muted)]">{maiorSaida ? maiorSaida.title : 'Sem dados'}</p>
          <p className="text-4xl font-semibold text-[var(--danger)]">{maiorSaida ? formatCurrency(maiorSaida.amount) : 'R$ 0,00'}</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Serie mensal (6 meses)</h2>
          <div className="flex h-48 items-end gap-2">
            {monthSeries.map((item) => (
              <div className="flex flex-1 flex-col items-center gap-1" key={item.month}>
                <div className="flex h-40 w-full items-end gap-1">
                  <div className="w-1/2 rounded-t bg-[var(--accent-strong)]" style={{ height: `${(item.income / maxSeries) * 100}%` }} />
                  <div className="w-1/2 rounded-t bg-[var(--danger)]" style={{ height: `${(item.expense / maxSeries) * 100}%` }} />
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">{monthLabel(item.month)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Composicao do volume</h2>
          <div className="space-y-3">
            <div className="h-4 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full bg-[var(--accent-strong)]" style={{ width: `${incomeRatio}%` }} />
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full bg-[var(--danger)]" style={{ width: `${expenseRatio}%` }} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Entradas: {incomeRatio.toFixed(1)}% | Saidas: {expenseRatio.toFixed(1)}%</p>
            <p className="text-xs text-[var(--text-muted)]">Ticket medio: <span className="font-medium text-[var(--text-primary)]">{formatCurrency(ticketMedio)}</span></p>
          </div>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Saldo por mes</h2>
          <div className="space-y-2">
            {monthSeries.map((item) => (
              <div className="space-y-1" key={`saldo-${item.month}`}>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>{monthLabel(item.month)}</span>
                  <span>{formatCurrency(item.saldo)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div
                    className={item.saldo >= 0 ? 'h-2 rounded-full bg-[var(--accent-strong)]' : 'h-2 rounded-full bg-[var(--danger)]'}
                    style={{ width: `${(Math.abs(item.saldo) / maxSeries) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Heatmap de atividade semanal</h2>
          <div className="grid grid-cols-4 gap-2">
            {dayHourMap.map((cell, index) => {
              const alpha = cell.value === 0 ? 0.08 : Math.max(0.15, cell.value / maxHeat)
              return (
                <div
                  className="rounded-lg border border-[var(--border)] px-2 py-3 text-center text-[10px] text-[var(--text-muted)]"
                  key={index}
                  style={{ backgroundColor: `rgba(21, 115, 71, ${alpha * 0.8})` }}
                  title={`Dia ${cell.weekday} / bloco ${cell.fromHour}h: ${formatCurrency(cell.value)}`}
                >
                  D{cell.weekday} B{cell.quarter + 1}
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Ranking de categorias</h2>
          <div className="space-y-2">
            {categoryPerformance.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">Nenhuma movimentacao financeira encontrada.</p>
            ) : (
              categoryPerformance.map((item) => (
                <div className="space-y-1" key={item.id}>
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>{item.nome}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div className="h-2 rounded-full bg-[var(--accent-strong)]" style={{ width: `${(item.total / maxCategoryTotal) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Desempenho por categoria</h2>
        <div className="space-y-3">
          {porCategoria.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">Nenhuma movimentacao financeira encontrada.</p>
          ) : (
            porCategoria.map((item) => (
              <article className="rounded-2xl border border-[var(--border)] p-3" key={item.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.nome}</p>
                  <p className={item.saldo >= 0 ? 'text-xs font-semibold text-[var(--accent-strong)]' : 'text-xs font-semibold text-[var(--danger)]'}>
                    {formatCurrency(item.saldo)}
                  </p>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <p className="text-xs text-[var(--text-muted)]">Entradas: <span className="font-medium text-[var(--accent-strong)]">{formatCurrency(item.entradas)}</span></p>
                  <p className="text-xs text-[var(--text-muted)]">Saidas: <span className="font-medium text-[var(--danger)]">{formatCurrency(item.saidas)}</span></p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
