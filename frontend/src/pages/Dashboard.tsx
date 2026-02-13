import { useMemo } from 'react'
import Header from '../components/dashboard/Header'
import StatCard from '../components/dashboard/StatCard'
import type { Category, Transaction, User } from '../types/finance'
import type { StatItem } from '../types/dashboard'
import { formatCurrency, formatDateBr } from '../utils'

type DashboardProps = {
  user: User | null
  categories: Category[]
  transactions: Transaction[]
  monthTransactions: Transaction[]
  selectedMonth: string
  onMonthChange: (month: string) => void
}

const monthShift = (month: string, diff: number) => {
  const [year, value] = month.split('-').map(Number)
  const d = new Date(Date.UTC(year, value - 1 + diff, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

const monthDays = (month: string) => {
  const [year, value] = month.split('-').map(Number)
  return new Date(year, value, 0).getDate()
}

const statusTone = (value: number) => (value >= 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--danger)]')

export default function Dashboard({
  user,
  categories,
  transactions,
  monthTransactions,
  selectedMonth,
  onMonthChange,
}: DashboardProps) {
  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.id, item.name])),
    [categories]
  )

  const totalIncomeMonth = monthTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)

  const totalExpenseMonth = monthTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  const saldoAtual = transactions.reduce(
    (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
    0
  )

  const prevMonthKey = monthShift(selectedMonth, -1)
  const prevMonthItems = transactions.filter((item) => item.date.startsWith(prevMonthKey))
  const saldoMesAnterior = prevMonthItems.reduce(
    (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
    0
  )

  const saldoMesAtual = totalIncomeMonth - totalExpenseMonth
  const comparacaoPercentual =
    saldoMesAnterior === 0
      ? saldoMesAtual === 0
        ? 0
        : 100
      : ((saldoMesAtual - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100

  const receitaPorCategoria = monthTransactions
    .filter((item) => item.type === 'income')
    .reduce<Record<string, number>>((acc, item) => {
      acc[item.categoryId] = (acc[item.categoryId] ?? 0) + item.amount
      return acc
    }, {})

  const despesaPorCategoria = monthTransactions
    .filter((item) => item.type === 'expense')
    .reduce<Record<string, number>>((acc, item) => {
      acc[item.categoryId] = (acc[item.categoryId] ?? 0) + item.amount
      return acc
    }, {})

  const despesaCategoriaRows = Object.entries(despesaPorCategoria)
    .map(([categoryId, total]) => ({ categoryId, nome: categoryNameById[categoryId] ?? 'Outros', total }))
    .sort((a, b) => b.total - a.total)

  const receitaCategoriaRows = Object.entries(receitaPorCategoria)
    .map(([categoryId, total]) => ({ categoryId, nome: categoryNameById[categoryId] ?? 'Outros', total }))
    .sort((a, b) => b.total - a.total)

  const ultimasCinco = [...monthTransactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const maiorDespesa = [...monthTransactions]
    .filter((item) => item.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0]
  const maiorReceita = [...monthTransactions]
    .filter((item) => item.type === 'income')
    .sort((a, b) => b.amount - a.amount)[0]

  const hoje = new Date()
  const currentMonthKey = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  const diasNoMes = monthDays(selectedMonth)
  const diasPassados = selectedMonth === currentMonthKey ? Math.max(1, hoje.getDate()) : diasNoMes

  const mediaDiariaGastos = totalExpenseMonth / diasPassados
  const previsaoSaldoMes = (saldoMesAtual / diasPassados) * diasNoMes
  const pendenteReceber = monthTransactions
    .filter((item) => item.type === 'income' && item.date > hoje.toISOString().slice(0, 10))
    .reduce((sum, item) => sum + item.amount, 0)

  const evolucaoMeses = [5, 4, 3, 2, 1, 0]
    .map((offset) => monthShift(selectedMonth, -offset))
    .map((month) => {
      const items = transactions.filter((item) => item.date.startsWith(month))
      const saldo = items.reduce((sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount), 0)
      return { month, short: month.slice(5), saldo }
    })

  const maxSaldoAbs = Math.max(1, ...evolucaoMeses.map((item) => Math.abs(item.saldo)))

  const statCards: StatItem[] = [
    { id: 'saldo-atual', title: 'Saldo atual', value: Number(saldoAtual.toFixed(2)), trend: 'Total consolidado', highlight: true },
    { id: 'entradas-mes', title: 'Entradas do mes', value: Number(totalIncomeMonth.toFixed(2)), trend: 'Total de receitas no periodo' },
    { id: 'saidas-mes', title: 'Saidas do mes', value: Number(totalExpenseMonth.toFixed(2)), trend: 'Total de despesas no periodo' },
    { id: 'saldo-mes-anterior', title: 'Saldo do mes anterior', value: Number(saldoMesAnterior.toFixed(2)), trend: 'Comparativo historico' },
  ]

  const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
  const weekly = weekdayNames.map((name, index) => {
    const amount = monthTransactions
      .filter((item) => item.type === 'expense')
      .filter((item) => new Date(`${item.date}T12:00:00`).getDay() === index)
      .reduce((sum, item) => sum + item.amount, 0)
    return { name, amount }
  })
  const maxWeekly = Math.max(1, ...weekly.map((item) => item.amount))

  const totalFlow = totalIncomeMonth + totalExpenseMonth
  const incomePct = totalFlow === 0 ? 0 : (totalIncomeMonth / totalFlow) * 100
  const expensePct = totalFlow === 0 ? 0 : (totalExpenseMonth / totalFlow) * 100

  const expensesByDay = Array.from({ length: diasNoMes }, (_, idx) => {
    const day = String(idx + 1).padStart(2, '0')
    const date = `${selectedMonth}-${day}`
    const amount = monthTransactions
      .filter((item) => item.type === 'expense' && item.date === date)
      .reduce((sum, item) => sum + item.amount, 0)
    return { day: idx + 1, amount }
  })
  const maxExpenseDay = Math.max(1, ...expensesByDay.map((item) => item.amount))

  const cumulativeFlow = Array.from({ length: diasNoMes }, (_, idx) => {
    const day = String(idx + 1).padStart(2, '0')
    const date = `${selectedMonth}-${day}`
    const dayValue = monthTransactions
      .filter((item) => item.date === date)
      .reduce((sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount), 0)
    return dayValue
  }).reduce<number[]>((acc, value) => {
    const previous = acc[acc.length - 1] ?? 0
    acc.push(previous + value)
    return acc
  }, [])
  const maxCumAbs = Math.max(1, ...cumulativeFlow.map((item) => Math.abs(item)))

  const topExpenseCategories = despesaCategoriaRows.slice(0, 5)
  const maxTopExpense = Math.max(1, ...topExpenseCategories.map((item) => item.total))

  return (
    <div className="space-y-4">
      <Header user={user} />

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Periodo ativo</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{selectedMonth}</p>
          </div>
          <input
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-primary)]"
            type="month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.45fr,1fr,1fr]">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Evolucao do saldo nos ultimos meses</h3>
          <div className="flex h-56 items-end justify-between gap-3">
            {evolucaoMeses.map((item) => {
              const h = Math.max(18, Math.round((Math.abs(item.saldo) / maxSaldoAbs) * 100))
              return (
                <div className="flex flex-1 flex-col items-center gap-2" key={item.month}>
                  <div
                    className={item.saldo >= 0 ? 'w-full rounded-full bg-[var(--accent-strong)]' : 'w-full rounded-full bg-[var(--surface-muted)]'}
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-xs text-[var(--text-muted)]">{item.short}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Comparativos</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Comparacao percentual</p>
              <p className={`text-2xl font-semibold ${statusTone(comparacaoPercentual)}`}>{comparacaoPercentual.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Media diaria de gastos</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(mediaDiariaGastos)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Previsao de saldo ate o fim do mes</p>
              <p className={`text-xl font-semibold ${statusTone(previsaoSaldoMes)}`}>{formatCurrency(previsaoSaldoMes)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Resumo mensal</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Maior despesa</p>
              <p className="text-lg font-semibold text-[var(--danger)]">{maiorDespesa ? formatCurrency(maiorDespesa.amount) : 'R$ 0,00'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Maior receita</p>
              <p className="text-lg font-semibold text-[var(--accent-strong)]">{maiorReceita ? formatCurrency(maiorReceita.amount) : 'R$ 0,00'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Pendente a receber</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{formatCurrency(pendenteReceber)}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Grafico semanal de despesas</h3>
          <div className="space-y-2">
            {weekly.map((item) => (
              <div className="flex items-center gap-3" key={item.name}>
                <span className="w-7 text-xs text-[var(--text-muted)]">{item.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div className="h-full rounded-full bg-[var(--danger)]" style={{ width: `${(item.amount / maxWeekly) * 100}%` }} />
                </div>
                <span className="w-20 text-right text-xs text-[var(--text-muted)]">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Mix de entradas e saidas</h3>
          <div className="space-y-4">
            <div className="h-4 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-4 bg-[var(--accent-strong)]" style={{ width: `${incomePct}%` }} />
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-4 bg-[var(--danger)]" style={{ width: `${expensePct}%` }} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Entradas: {incomePct.toFixed(1)}% | Saidas: {expensePct.toFixed(1)}%</p>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Top categorias de despesas</h3>
          <div className="space-y-2">
            {topExpenseCategories.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">Sem despesas no periodo.</p>
            ) : (
              topExpenseCategories.map((item) => (
                <div className="space-y-1" key={item.categoryId}>
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>{item.nome}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div className="h-2 rounded-full bg-[var(--accent-strong)]" style={{ width: `${(item.total / maxTopExpense) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Mapa de calor de gastos diarios</h3>
          <div className="grid grid-cols-8 gap-2">
            {expensesByDay.map((item) => {
              const intensity = item.amount === 0 ? 0 : Math.max(0.2, item.amount / maxExpenseDay)
              return (
                <div
                  className="rounded-lg border border-[var(--border)] px-2 py-2 text-center text-xs text-[var(--text-muted)]"
                  key={item.day}
                  style={{ backgroundColor: `rgba(217, 90, 90, ${intensity * 0.7})` }}
                  title={`Dia ${item.day}: ${formatCurrency(item.amount)}`}
                >
                  {item.day}
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Acumulado do mes</h3>
          <div className="flex h-52 items-end gap-1">
            {cumulativeFlow.map((item, index) => {
              const height = Math.max(8, Math.round((Math.abs(item) / maxCumAbs) * 100))
              return (
                <div
                  className={item >= 0 ? 'flex-1 rounded-t bg-[var(--accent-strong)]' : 'flex-1 rounded-t bg-[var(--danger)]'}
                  key={index}
                  style={{ height: `${height}%` }}
                  title={`Dia ${index + 1}: ${formatCurrency(item)}`}
                />
              )
            })}
          </div>
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Totais por categoria</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Despesas</p>
              <div className="space-y-2">
                {despesaCategoriaRows.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">Sem despesas no periodo.</p>
                ) : (
                  despesaCategoriaRows.map((item) => (
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-3 py-2" key={item.categoryId}>
                      <span className="text-xs text-[var(--text-primary)]">{item.nome}</span>
                      <span className="text-xs font-medium text-[var(--danger)]">{formatCurrency(item.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Receitas</p>
              <div className="space-y-2">
                {receitaCategoriaRows.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">Sem receitas no periodo.</p>
                ) : (
                  receitaCategoriaRows.map((item) => (
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-3 py-2" key={item.categoryId}>
                      <span className="text-xs text-[var(--text-primary)]">{item.nome}</span>
                      <span className="text-xs font-medium text-[var(--accent-strong)]">{formatCurrency(item.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Ultimas 5 transacoes</h3>
          <div className="space-y-2">
            {ultimasCinco.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">Nenhuma transacao encontrada.</p>
            ) : (
              ultimasCinco.map((item) => (
                <div className="rounded-2xl border border-[var(--border)] p-3" key={item.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{formatDateBr(item.date)} - {categoryNameById[item.categoryId] ?? 'Outros'}</p>
                    </div>
                    <p className={item.type === 'income' ? 'text-sm font-semibold text-[var(--accent-strong)]' : 'text-sm font-semibold text-[var(--danger)]'}>
                      {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  )
}
