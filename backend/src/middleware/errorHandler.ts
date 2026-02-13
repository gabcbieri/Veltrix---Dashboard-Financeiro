import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Dados invalidos.',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code?: string }).code)
    if (code === 'P2002') {
      return response.status(409).json({ message: 'Registro duplicado.' })
    }
    if (code === 'P2025') {
      return response.status(404).json({ message: 'Registro nao encontrado.' })
    }
  }

  if (error instanceof Error) {
    return response.status(500).json({ message: error.message })
  }

  return response.status(500).json({ message: 'Erro interno.' })
}
