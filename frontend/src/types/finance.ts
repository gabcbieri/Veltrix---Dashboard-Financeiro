export type TransactionType = 'income' | 'expense'

export type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

export type Category = {
  id: string
  name: string
  isSystem?: boolean
}

export type Transaction = {
  id: string
  title: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
  category?: Pick<Category, 'id' | 'name'>
}

export type AuthResponse = {
  token: string
  user: User
}

export type LoginTokenRequestResponse = {
  message: string
  devToken?: string
}

export type UpdateProfilePayload = {
  name: string
  avatarUrl?: string | null
}

export type UpdatePasswordPayload = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
