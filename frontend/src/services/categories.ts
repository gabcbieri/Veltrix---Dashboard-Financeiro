import { api } from './api'
import type { Category } from '../types/finance'

export const listCategories = async () => {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export const createCategory = async (name: string) => {
  const { data } = await api.post<Category>('/categories', { name })
  return data
}

export const updateCategory = async (categoryId: string, name: string) => {
  const { data } = await api.patch<Category>(`/categories/${categoryId}`, { name })
  return data
}

export const deleteCategory = async (categoryId: string) => {
  await api.delete(`/categories/${categoryId}`)
}
