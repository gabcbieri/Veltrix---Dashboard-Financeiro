import { Router } from 'express'

const router = Router()

router.get('/stats', (_request, response) => {
  response.json([
    { id: 'total', title: 'Total Projects', value: 24, trend: 'Increased from last month', highlight: true },
    { id: 'ended', title: 'Ended Projects', value: 10, trend: 'Increased from last month' },
    { id: 'running', title: 'Running Projects', value: 12, trend: 'Increased from last month' },
    { id: 'pending', title: 'Pending Project', value: 2, trend: 'On Discuss' },
  ])
})

router.get('/projects', (_request, response) => {
  response.json({
    analytics: [
      { label: 'S', value: 60, striped: true },
      { label: 'M', value: 72 },
      { label: 'T', value: 64, accent: true },
      { label: 'W', value: 78 },
      { label: 'T', value: 68, striped: true },
      { label: 'F', value: 62, striped: true },
      { label: 'S', value: 70, striped: true },
    ],
    reminder: {
      title: 'Meeting with Arc Company',
      time: '02:00 pm - 04:00 pm',
      cta: 'Start Meeting',
    },
    progress: {
      percent: 41,
      label: 'Project Ended',
    },
    timeTracker: '01:24:08',
  })
})

router.get('/team', (_request, response) => {
  response.json([
    {
      id: 'team-1',
      name: 'Alexandra Deff',
      role: 'Working on Github Project Repository',
      status: 'Completed',
      avatar: 'AD',
    },
    {
      id: 'team-2',
      name: 'Edwin Adenike',
      role: 'Working on Integrate User Authentication System',
      status: 'In Progress',
      avatar: 'EA',
    },
    {
      id: 'team-3',
      name: 'Isaac Oluwatemilorun',
      role: 'Working on Develop Search and Filter Functionality',
      status: 'Pending',
      avatar: 'IO',
    },
  ])
})

router.get('/tasks', (_request, response) => {
  response.json([
    { id: 'task-1', title: 'Develop API Endpoints', due: 'Nov 26, 2026', color: 'blue' },
    { id: 'task-2', title: 'Onboarding Flow', due: 'Nov 28, 2026', color: 'green' },
    { id: 'task-3', title: 'Build Dashboard', due: 'Nov 30, 2026', color: 'yellow' },
    { id: 'task-4', title: 'Optimize Page Load', due: 'Dec 5, 2026', color: 'orange' },
    { id: 'task-5', title: 'Cross-Browser Testing', due: 'Dec 6, 2026', color: 'purple' },
  ])
})

export default router
