import { createError, defineEventHandler } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const cardNumber = Number(event.context.params?.cardNumber)

  if (!Number.isInteger(cardNumber)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'cardNumber must be an integer'
    })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('qsl_cards')
    .select('id, card_number, style_id, to_radio, created_at, updated_at')
    .eq('card_number', cardNumber)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Card not found'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch card',
      data: error.message
    })
  }

  return data
})
