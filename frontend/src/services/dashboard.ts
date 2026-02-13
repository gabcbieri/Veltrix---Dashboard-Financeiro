import { api } from './api'
import type { ProjectBundle, StatItem, TaskItem, TeamMember } from '../types/dashboard'

export const getStats = async () => {
  const { data } = await api.get<StatItem[]>('/stats')
  return data
}

export const getProjects = async () => {
  const { data } = await api.get<ProjectBundle>('/projects')
  return data
}

export const getTeam = async () => {
  const { data } = await api.get<TeamMember[]>('/team')
  return data
}

export const getTasks = async () => {
  const { data } = await api.get<TaskItem[]>('/tasks')
  return data
}
