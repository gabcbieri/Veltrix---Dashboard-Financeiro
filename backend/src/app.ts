import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/auth'
import categoryRoutes from './routes/categories'
import transactionRoutes from './routes/transactions'
import dashboardRoutes from './routes/dashboard'
import { auth } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { config } from './lib/config'

export const app = express()

app.use(helmet())
app.use(
  cors({
    origin: config.frontendUrl,
  })
)
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', auth, categoryRoutes)
app.use('/api/transactions', auth, transactionRoutes)
app.use('/api', auth, dashboardRoutes)

app.use(errorHandler)
