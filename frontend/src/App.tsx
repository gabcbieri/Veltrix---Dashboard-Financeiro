import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from './components/layout/AuthLayout'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { setUnauthorizedHandler, TOKEN_KEY } from './services/api'
import { logoutRequest, meRequest, updatePasswordRequest, updateProfileRequest } from './services/auth'
import { createCategory, deleteCategory, listCategories, updateCategory } from './services/categories'
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from './services/transactions'
import type { AppPreferences } from './types/preferences'
import type { Category, Transaction, User } from './types/finance'

const STORAGE_KEYS = {
  month: 'dash_selected_month',
  preferences: 'dash_preferences',
}

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'light',
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  firstDayOfWeek: 'monday',
  dateFormat: 'dd/MM/yyyy',
  emailNotifications: true,
  pushNotifications: false,
  monthlyGoal: 0,
  weeklyBudget: 0,
  compactMode: false,
  company: '',
  phone: '',
}

const nowDate = new Date()
const currentMonth = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`

const isAuthed = () => !!localStorage.getItem(TOKEN_KEY)

const Guard = ({ authed, children }: { authed: boolean; children: ReactNode }) => {
  if (!authed) return <Navigate to="/login" replace />
  return <>{children}</>
}

const loadStoredMonth = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.month)
  if (!raw) return currentMonth
  try {
    return JSON.parse(raw) as string
  } catch {
    return currentMonth
  }
}

const loadStoredPreferences = (): AppPreferences => {
  const raw = localStorage.getItem(STORAGE_KEYS.preferences)
  if (!raw) return DEFAULT_PREFERENCES
  try {
    const parsed = {
      ...DEFAULT_PREFERENCES,
      ...(JSON.parse(raw) as Partial<AppPreferences>),
    }
    return { ...parsed, theme: 'light' }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }
  return 'Nao foi possivel completar a operacao.'
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthed)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(loadStoredMonth)
  const [preferences, setPreferences] = useState<AppPreferences>(loadStoredPreferences)
  const [bootstrapping, setBootstrapping] = useState(isAuthed())
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleAuthChange = useCallback(() => {
    setAuthed(isAuthed())
  }, [])

  const logout = useCallback(() => {
    logoutRequest()
    setAuthed(false)
    setCurrentUser(null)
    setCategories([])
    setTransactions([])
  }, [])

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message)
  }, [])

  const handleUnauthorized = useCallback(() => {
    setErrorMessage('Sessao expirada. Faca login novamente.')
    logout()
  }, [logout])

  const guardedRequest = useCallback(
    async <T,>(request: () => Promise<T>) => {
      try {
        setErrorMessage(null)
        return await request()
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null
        }
        setErrorMessage(getApiErrorMessage(error))
        throw error
      }
    },
    []
  )

  const loadFinanceData = useCallback(async () => {
    if (!authed) return
    setLoading(true)
    try {
      const [categoryData, transactionData] = await Promise.all([
        guardedRequest(() => listCategories()),
        guardedRequest(() => listTransactions()),
      ])

      if (!categoryData || !transactionData) return
      setCategories(categoryData)
      setTransactions(transactionData)
    } finally {
      setLoading(false)
    }
  }, [authed, guardedRequest])

  useEffect(() => {
    window.addEventListener('storage', handleAuthChange)
    return () => window.removeEventListener('storage', handleAuthChange)
  }, [handleAuthChange])

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized)
    return () => setUnauthorizedHandler(null)
  }, [handleUnauthorized])

  useEffect(() => {
    if (!successMessage) return
    const timeout = window.setTimeout(() => setSuccessMessage(null), 2800)
    return () => window.clearTimeout(timeout)
  }, [successMessage])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.month, JSON.stringify(selectedMonth))
  }, [selectedMonth])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences))
    const root = document.documentElement
    root.classList.toggle('theme-dark', preferences.theme === 'dark')
    root.classList.toggle('theme-light', preferences.theme !== 'dark')
    root.style.colorScheme = preferences.theme
  }, [preferences])

  useEffect(() => {
    if (!authed) {
      setBootstrapping(false)
      setCurrentUser(null)
      setCategories([])
      setTransactions([])
      setErrorMessage(null)
      return
    }

    setBootstrapping(true)
    void (async () => {
      try {
        const session = await guardedRequest(() => meRequest())
        if (!session) return
        setCurrentUser(session)
        await loadFinanceData()
      } finally {
        setBootstrapping(false)
      }
    })()
  }, [authed, guardedRequest, loadFinanceData])

  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.date.startsWith(selectedMonth)),
    [selectedMonth, transactions]
  )

  const addTransaction = useCallback(
    async (payload: Omit<Transaction, 'id'>) => {
      const created = await guardedRequest(() => createTransaction(payload))
      if (!created) return
      setTransactions((current) => [created, ...current])
      showSuccess('Lancamento adicionado.')
    },
    [guardedRequest, showSuccess]
  )

  const editTransaction = useCallback(
    async (transactionId: string, payload: Omit<Transaction, 'id'>) => {
      const updated = await guardedRequest(() => updateTransaction(transactionId, payload))
      if (!updated) return
      setTransactions((current) =>
        current.map((transaction) => (transaction.id === transactionId ? updated : transaction))
      )
      showSuccess('Lancamento atualizado.')
    },
    [guardedRequest, showSuccess]
  )

  const removeTransaction = useCallback(
    async (transactionId: string) => {
      const result = await guardedRequest(() => deleteTransaction(transactionId))
      if (result === null) return
      setTransactions((current) => current.filter((transaction) => transaction.id !== transactionId))
      showSuccess('Lancamento removido.')
    },
    [guardedRequest, showSuccess]
  )

  const addCategory = useCallback(
    async (name: string) => {
      const created = await guardedRequest(() => createCategory(name))
      if (!created) return
      setCategories((current) => [...current, created])
      showSuccess('Categoria criada.')
    },
    [guardedRequest, showSuccess]
  )

  const editCategory = useCallback(
    async (categoryId: string, name: string) => {
      const updated = await guardedRequest(() => updateCategory(categoryId, name))
      if (!updated) return

      setCategories((current) => current.map((category) => (category.id === categoryId ? updated : category)))
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.categoryId === categoryId
            ? { ...transaction, category: { id: updated.id, name: updated.name } }
            : transaction
        )
      )
      showSuccess('Categoria atualizada.')
    },
    [guardedRequest, showSuccess]
  )

  const removeCategory = useCallback(
    async (categoryId: string) => {
      const result = await guardedRequest(() => deleteCategory(categoryId))
      if (result === null) return
      await loadFinanceData()
      showSuccess('Categoria removida.')
    },
    [guardedRequest, loadFinanceData, showSuccess]
  )

  const saveProfile = useCallback(
    async (payload: { name: string; avatarUrl?: string | null }) => {
      const updated = await guardedRequest(() => updateProfileRequest(payload))
      if (!updated) return
      setCurrentUser(updated)
      showSuccess('Perfil atualizado.')
    },
    [guardedRequest, showSuccess]
  )

  const savePassword = useCallback(
    async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const result = await guardedRequest(() => updatePasswordRequest(payload))
      if (!result) return
      showSuccess('Senha atualizada com sucesso.')
    },
    [guardedRequest, showSuccess]
  )

  const savePreferences = useCallback(
    (next: AppPreferences) => {
      setPreferences(next)
      showSuccess('Configuracoes salvas.')
    },
    [showSuccess]
  )

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
    showSuccess('Configuracoes restauradas para o padrao.')
  }, [showSuccess])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={authed ? <Navigate to="/" replace /> : <Login onLogin={handleAuthChange} />} />
          <Route
            path="/register"
            element={authed ? <Navigate to="/" replace /> : <Register onRegister={handleAuthChange} />}
          />
        </Route>

        <Route
          path="/"
          element={
            <Guard authed={authed}>
              <AppLayout onLogout={logout} user={currentUser} />
            </Guard>
          }
        >
          <Route
            index
            element={
              <Dashboard
                user={currentUser}
                categories={categories}
                transactions={transactions}
                monthTransactions={monthTransactions}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            }
          />
          <Route
            path="transactions"
            element={
              <Transactions
                categories={categories}
                transactions={monthTransactions}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                onAdd={addTransaction}
                onUpdate={editTransaction}
                onDelete={removeTransaction}
              />
            }
          />
          <Route
            path="categories"
            element={
              <Categories
                categories={categories}
                transactions={transactions}
                onAdd={addCategory}
                onUpdate={editCategory}
                onDelete={removeCategory}
              />
            }
          />
          <Route
            path="profile"
            element={
              currentUser ? (
                <Profile user={currentUser} onUpdatePassword={savePassword} onUpdateProfile={saveProfile} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="analytics" element={<Analytics categories={categories} transactions={transactions} />} />
          <Route
            path="settings"
            element={
              <Settings
                user={currentUser}
                preferences={preferences}
                onThemeChange={(theme) => setPreferences((current) => ({ ...current, theme }))}
                onResetPreferences={resetPreferences}
                onSavePreferences={savePreferences}
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {(bootstrapping || loading || errorMessage || successMessage) && (
        <div className="fixed bottom-4 right-4 z-50">
          {(bootstrapping || loading) && (
            <p className="rounded-lg bg-carbon/90 px-4 py-2 text-xs text-white/80">Carregando dados...</p>
          )}
          {successMessage && <p className="mt-2 rounded-lg bg-emerald-900/80 px-4 py-2 text-xs text-emerald-100">{successMessage}</p>}
          {errorMessage && <p className="mt-2 rounded-lg bg-red-900/80 px-4 py-2 text-xs text-red-100">{errorMessage}</p>}
        </div>
      )}
    </BrowserRouter>
  )
}
