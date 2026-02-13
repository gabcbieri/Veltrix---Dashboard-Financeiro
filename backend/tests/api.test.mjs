import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createRequire } from 'node:module'

process.env.LOGIN_TOKEN_DEV_EXPOSE = 'true'

const require = createRequire(import.meta.url)
const { app } = require('../dist/app.js')
const { prisma } = require('../dist/lib/prisma.js')

let server
let baseUrl = ''

const testUsers = []

const makeEmail = () => `smoke.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@dash.test`

const requestJson = async (path, { method = 'GET', token, body } = {}) => {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  return { response, data }
}

test.before(async () => {
  server = app.listen(0)
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Nao foi possivel obter a porta do servidor de teste.')
  }
  baseUrl = `http://127.0.0.1:${address.port}/api`
})

test.after(async () => {
  if (testUsers.length > 0) {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers,
        },
      },
    })
  }

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve(undefined)))
    })
  }

  await prisma.$disconnect()
})

test('auth: register, login and get profile', async () => {
  const email = makeEmail()
  testUsers.push(email)

  const register = await requestJson('/auth/register', {
    method: 'POST',
    body: {
      name: 'Smoke Auth',
      email,
      password: '123456',
    },
  })

  assert.equal(register.response.status, 201)
  assert.equal(typeof register.data?.token, 'string')
  assert.equal(register.data?.user?.email, email)

  const login = await requestJson('/auth/login', {
    method: 'POST',
    body: {
      email,
      password: '123456',
    },
  })

  assert.equal(login.response.status, 200)
  assert.equal(typeof login.data?.token, 'string')

  const me = await requestJson('/auth/me', {
    token: login.data?.token,
  })

  assert.equal(me.response.status, 200)
  assert.equal(me.data?.email, email)
})

test('categories and transactions: create and list', async () => {
  const email = makeEmail()
  testUsers.push(email)

  const register = await requestJson('/auth/register', {
    method: 'POST',
    body: {
      name: 'Smoke Finance',
      email,
      password: '123456',
    },
  })
  assert.equal(register.response.status, 201)

  const token = register.data?.token
  assert.equal(typeof token, 'string')

  const categories = await requestJson('/categories', { token })
  assert.equal(categories.response.status, 200)
  assert.equal(Array.isArray(categories.data), true)
  assert.equal(categories.data.length > 0, true)

  const customCategory = await requestJson('/categories', {
    method: 'POST',
    token,
    body: { name: 'Saude' },
  })
  assert.equal(customCategory.response.status, 201)
  assert.equal(customCategory.data?.name, 'Saude')

  const now = new Date()
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  const date = `${month}-15`

  const createdTransaction = await requestJson('/transactions', {
    method: 'POST',
    token,
    body: {
      title: 'Consulta',
      amount: 120.5,
      type: 'expense',
      date,
      categoryId: customCategory.data?.id,
    },
  })

  assert.equal(createdTransaction.response.status, 201)
  assert.equal(createdTransaction.data?.title, 'Consulta')
  assert.equal(createdTransaction.data?.categoryId, customCategory.data?.id)

  const monthTransactions = await requestJson(`/transactions?month=${month}`, { token })
  assert.equal(monthTransactions.response.status, 200)
  assert.equal(Array.isArray(monthTransactions.data), true)
  assert.equal(
    monthTransactions.data.some((item) => item.id === createdTransaction.data?.id),
    true
  )
})

test('auth token login: request and verify without password', async () => {
  const email = makeEmail()
  testUsers.push(email)

  const register = await requestJson('/auth/register', {
    method: 'POST',
    body: {
      name: 'Smoke Token',
      email,
      password: '123456',
    },
  })
  assert.equal(register.response.status, 201)

  const requestToken = await requestJson('/auth/login-token/request', {
    method: 'POST',
    body: { email },
  })

  assert.equal(requestToken.response.status, 200)
  assert.equal(typeof requestToken.data?.message, 'string')
  assert.equal(typeof requestToken.data?.devToken, 'string')

  const verify = await requestJson('/auth/login-token/verify', {
    method: 'POST',
    body: {
      email,
      token: requestToken.data?.devToken,
    },
  })

  assert.equal(verify.response.status, 200)
  assert.equal(typeof verify.data?.token, 'string')
  assert.equal(verify.data?.user?.email, email)
})
