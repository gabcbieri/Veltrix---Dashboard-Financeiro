import { api, TOKEN_KEY } from './api'
import type { AuthResponse, UpdatePasswordPayload, UpdateProfilePayload, User } from '../types/finance'

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  name: string
  email: string
  password: string
}

export const loginRequest = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  localStorage.setItem(TOKEN_KEY, data.token)
  return data
}

export const registerRequest = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  localStorage.setItem(TOKEN_KEY, data.token)
  return data
}

export const logoutRequest = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const meRequest = async () => {
  const { data } = await api.get<User>('/auth/me')
  return data
}

export const updateProfileRequest = async (payload: UpdateProfilePayload) => {
  const { data } = await api.patch<User>('/auth/profile', payload)
  return data
}

export const updatePasswordRequest = async (payload: UpdatePasswordPayload) => {
  const { data } = await api.patch<{ message: string }>('/auth/password', payload)
  return data
}
