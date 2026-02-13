import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import type { Category, Transaction } from '../types/finance'
import Button from '../components/ui/Button'

type CategoriesProps = {
  categories: Category[]
  transactions: Transaction[]
  onAdd: (name: string) => Promise<void>
  onUpdate: (categoryId: string, name: string) => Promise<void>
  onDelete: (categoryId: string) => Promise<void>
}

const inputClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-strong)] focus:outline-none'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message
  }
  return fallback
}

export default function Categories({ categories, transactions, onAdd, onUpdate, onDelete }: CategoriesProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nameValue, setNameValue] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const categoryUsage = useMemo(
    () =>
      transactions.reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.categoryId] = (accumulator[item.categoryId] ?? 0) + 1
        return accumulator
      }, {}),
    [transactions]
  )

  const openCreate = () => {
    setEditingId(null)
    setNameValue('')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditingId(category.id)
    setNameValue(category.name)
    setErrorMessage(null)
    setModalOpen(true)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = nameValue.trim()
    if (!cleanName) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      if (editingId) await onUpdate(editingId, cleanName)
      else await onAdd(cleanName)

      setModalOpen(false)
      setNameValue('')
      setEditingId(null)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel salvar a categoria.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    setDeletingId(categoryId)
    setErrorMessage(null)
    try {
      await onDelete(categoryId)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nao foi possivel excluir a categoria.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Categorias</h1>
            <p className="text-xs text-[var(--text-muted)]">Organize os lancamentos com categorias claras e editaveis.</p>
          </div>
          <Button className="bg-[var(--accent-strong)] text-white hover:opacity-90" onClick={openCreate}>
            Nova categoria
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-7 text-center text-sm text-[var(--text-muted)]">
            Nenhuma categoria criada ainda.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{category.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{categoryUsage[category.id] ?? 0} lancamentos</p>
                </div>
                <div className="flex gap-3">
                  <button className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => openEdit(category)}>
                    Editar
                  </button>
                  <button
                    className="text-xs text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={Boolean(category.isSystem) || deletingId === category.id}
                    onClick={() => {
                      void handleDelete(category.id)
                    }}
                  >
                    {deletingId === category.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{editingId ? 'Editar categoria' : 'Nova categoria'}</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Defina um nome direto para facilitar os filtros.</p>
            <form className="mt-4 space-y-4" noValidate onSubmit={(event) => void submit(event)}>
              <input
                className={inputClass}
                placeholder="Nome da categoria"
                value={nameValue}
                onChange={(event) => setNameValue(event.target.value)}
                required
              />
              {errorMessage && <p className="text-xs text-[var(--danger)]">{errorMessage}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  className="bg-[var(--surface-muted)] text-[var(--text-primary)]"
                  onClick={() => {
                    setModalOpen(false)
                    setEditingId(null)
                    setNameValue('')
                    setErrorMessage(null)
                  }}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button className="bg-[var(--accent-strong)] text-white hover:opacity-90 disabled:opacity-60" type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
