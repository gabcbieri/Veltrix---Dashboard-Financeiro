export type ThemeMode = 'light' | 'dark'

export type AppPreferences = {
  theme: ThemeMode
  language: string
  currency: string
  timezone: string
  firstDayOfWeek: 'monday' | 'sunday'
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy'
  emailNotifications: boolean
  pushNotifications: boolean
  monthlyGoal: number
  weeklyBudget: number
  compactMode: boolean
  company: string
  phone: string
}
