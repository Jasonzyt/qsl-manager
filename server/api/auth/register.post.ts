import { createError, defineEventHandler, readBody } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

type RegisterPayload = {
  email?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as RegisterPayload
  const email = body.email?.trim()
  const password = body.password

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email and password are required'
    })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data: users, error: countError } = await client.auth.admin.listUsers()
  const count = users?.users.length
  console.log('Existing user count:', count)

  const isFirstUser = (count ?? 0) === 0

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role: isFirstUser ? 'admin' : 'user'
    }
  })

  if (!isFirstUser || error) {
    throw createError({
      statusCode: error?.status ?? 500,
      statusMessage: error?.message ?? 'User already exists',
    })
  }

  return {
    user: data.user,
    role: isFirstUser ? 'admin' : 'user'
  }
})
