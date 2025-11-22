import { createError, defineEventHandler } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('qsl_cards')
    .select('id, card_number, style_id, to_radio, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch cards',
      data: error.message
    })
  }

  return data
})
