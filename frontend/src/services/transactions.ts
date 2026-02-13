import { api } from './api'
import type { Transaction, TransactionType } from '../types/finance'

export type TransactionPayload = {
  title: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
}

export const listTransactions = async () => {
  const { data } = await api.get<Transaction[]>('/transactions')
  return data
}

export const createTransaction = async (payload: TransactionPayload) => {
  const { data } = await api.post<Transaction>('/transactions', payload)
  return data
}

export const updateTransaction = async (transactionId: string, payload: TransactionPayload) => {
  const { data } = await api.patch<Transaction>(`/transactions/${transactionId}`, payload)
  return data
}

export const deleteTransaction = async (transactionId: string) => {
  await api.delete(`/transactions/${transactionId}`)
}
