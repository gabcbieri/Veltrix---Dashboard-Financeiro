export type MenuItem = {
  id: string
  label: string
}

export type StatItem = {
  id: string
  title: string
  value: number
  trend: string
  highlight?: boolean
}

export type AnalyticsBar = {
  label: string
  value: number
  striped?: boolean
  accent?: boolean
}

export type Reminder = {
  title: string
  time: string
  cta: string
}

export type ProgressInfo = {
  percent: number
  label: string
}

export type ProjectBundle = {
  analytics: AnalyticsBar[]
  reminder: Reminder
  progress: ProgressInfo
  timeTracker: string
}

export type TeamMember = {
  id: string
  name: string
  role: string
  status: 'Completed' | 'In Progress' | 'Pending'
  avatar: string
}

export type TaskItem = {
  id: string
  title: string
  due: string
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'purple'
}
