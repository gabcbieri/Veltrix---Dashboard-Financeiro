import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api'

export const TOKEN_KEY = 'dash_token'
let unauthorizedHandler: (() => void) | null = null

export const api = axios.create({
  baseURL: API_URL,
})

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  }
)
