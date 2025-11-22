import { createError, defineEventHandler, getQuery } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const query = getQuery(event)
  const search = typeof query.q === 'string' ? query.q.trim() : ''

  const builder = client
    .from('qsl_cards')
    .select('id, card_number, style_id, to_radio, created_at, updated_at')
    .order('updated_at', { ascending: false })

  const { data, error } = await (search
    ? builder.ilike('to_radio', `%${search}%`)
    : builder)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch cards',
      data: error.message
    })
  }

  return data
})
