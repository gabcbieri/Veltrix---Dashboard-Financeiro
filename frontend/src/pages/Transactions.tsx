import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import type { Category, Transaction } from '../types/finance'
import Button from '../components/ui/Button'
import { formatCurrency, formatDateBr, formatMonthLabel } from '../utils'

type TransactionPayload = Omit<Transaction, 'id'>

type TransactionsProps = {
  categories: Category[]
  transactions: Transaction[]
  selectedMonth: string
  onMonthChange: (month: string) => void
  onAdd: (payload: TransactionPayload) => Promise<void>
  onUpdate: (transactionId: string, payload: TransactionPayload) => Promise<void>
  onDelete: (transactionId: string) => Promise<void>
}

const inputClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-strong)] focus:outline-none'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message
  }
  return fallback
}

type FormValues = {
  title: string
  amount: string
  type: 'income' | 'expense'
  date: string
  categoryId: string
}

const emptyForm = (defaultCategoryId: string, selectedMonth: string): FormValues => ({
  title: '',
  amount: '',
  type: 'income',
  date: `${selectedMonth}-01`,
  categoryId: defaultCategoryId,
})

export default function Transactions({
  categories,
  transactions,
  selectedMonth,
  onMonthChange,
  onAdd,
  onUpdate,
  onDelete,
}: TransactionsProps) {
  const defaultCategoryId = categories[0]?.id ?? ''
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState<FormValues>(() => emptyForm(defaultCategoryId, selectedMonth))
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const filteredTransactions = useMemo(
    () =>
      transactions
        .filter((item) => (typeFilter === 'all' ? true : item.type === typeFilter))
        .filter((item) => (categoryFilter === 'all' ? true : item.categoryId === categoryFilter))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, typeFilter, categoryFilter]
  )

  const resetForm = () => {
    setEditing(null)
    setForm(emptyForm(defaultCategoryId, selectedMonth))
    setErrorMessage(null)
  }

  const openCreateModal = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditing(transaction)
    setForm({
      title: transaction.title,
      amount: String(transaction.amount),
      type: transaction.type,
      date: transaction.date,
      categoryId: transaction.categoryId,
    })
    setErrorMessage(null)
    setModalOpen(true)
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const parsedAmount = Number(form.amount.replace(',', '.'))
    if (!form.title.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Informe descricao e valor valido.')
      return
    }

    if (!form.categoryId) {
      setErrorMessage('Selecione uma categoria para continuar.')
      return
    }

    const payload: TransactionPayload = {
      title: form.title.trim(),
      amount: parsedAmount,
      type: form.type,
      date: form.date,
      categoryId: form.categoryId || defaultCategoryId,
    }

    setSubmitting(true)
    try {
      if (editing) {
        await onUpdate(editing.id, payload)
      } else {
        await onAdd(payload)
      }
      setModalOpen(false)
      resetForm()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel salvar o lancamento.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (transactionId: string) => {
    setDeletingId(transactionId)
    setErrorMessage(null)
    try {
      await onDelete(transactionId)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel excluir o lancamento.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Lancamentos</h1>
            <p className="text-xs text-[var(--text-muted)]">Controle entradas e saidas de {formatMonthLabel(selectedMonth)}.</p>
          </div>
          <Button className="bg-[var(--accent-strong)] text-white hover:opacity-90" onClick={openCreateModal}>
            Adicionar
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <input className={inputClass} type="month" value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)} />
          <select className={inputClass} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
            <option value="all">Todos os tipos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saidas</option>
          </select>
          <select className={inputClass} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
              Nenhum lancamento encontrado para este filtro.
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{transaction.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {transaction.type === 'income' ? 'Entrada' : 'Saida'} | {formatDateBr(transaction.date)} |{' '}
                    {transaction.category?.name ?? categories.find((item) => item.id === transaction.categoryId)?.name ?? 'Outros'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-[var(--accent-strong)]' : 'text-[var(--danger)]'}`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                  <button className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => openEditModal(transaction)}>
                    Editar
                  </button>
                  <button
                    className="text-xs text-[var(--danger)] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={deletingId === transaction.id}
                    onClick={() => {
                      void handleDelete(transaction.id)
                    }}
                  >
                    {deletingId === transaction.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">{editing ? 'Editar lancamento' : 'Novo lancamento'}</h2>
              <p className="text-xs text-[var(--text-muted)]">Preencha os dados para atualizar seu resumo.</p>
            </div>
            <form className="space-y-3" noValidate onSubmit={(event) => void submitForm(event)}>
              <input
                className={inputClass}
                placeholder="Descricao"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Valor"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  required
                />
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as FormValues['type'] }))}
                >
                  <option value="income">Entrada</option>
                  <option value="expense">Saida</option>
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className={inputClass}
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  required
                />
                <select
                  className={inputClass}
                  value={form.categoryId}
                  onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {errorMessage && <p className="text-xs text-[var(--danger)]">{errorMessage}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  className="bg-[var(--surface-muted)] text-[var(--text-primary)]"
                  onClick={() => {
                    setModalOpen(false)
                    resetForm()
                  }}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button className="bg-[var(--accent-strong)] text-white hover:opacity-90 disabled:opacity-60" type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
