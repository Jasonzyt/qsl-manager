import { createError, defineEventHandler } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('qsl_card_styles')
    .select('id, style_name, created_at')
    .order('id', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch styles',
      data: error.message
    })
  }

  return data
})
