import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../lib/config'

type TokenPayload = {
  sub: string
}

export const auth = (request: Request, response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Token ausente.' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload
    request.userId = payload.sub
    return next()
  } catch {
    return response.status(401).json({ message: 'Token invalido.' })
  }
}
