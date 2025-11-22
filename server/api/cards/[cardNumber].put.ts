import { createError, defineEventHandler, readBody } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

type CardUpdatePayload = {
  cardNumber?: number
  card_number?: number
  styleId?: number
  style_id?: number
  toRadio?: string
  to_radio?: string
}

export default defineEventHandler(async (event) => {
  const cardNumber = Number(event.context.params?.cardNumber)

  if (!Number.isInteger(cardNumber)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'cardNumber must be an integer'
    })
  }

  const body = (await readBody(event)) as CardUpdatePayload
  const updates: {
    card_number?: number
    style_id?: number
    to_radio?: string
    updated_at?: string
  } = {}

  const nextCardNumber = body.cardNumber ?? body.card_number
  const nextStyleId = body.styleId ?? body.style_id
  const nextToRadio = body.toRadio ?? body.to_radio

  if (nextCardNumber !== undefined) {
    if (!Number.isInteger(Number(nextCardNumber))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'cardNumber must be an integer when provided'
      })
    }
    updates.card_number = Number(nextCardNumber)
  }

  if (nextStyleId !== undefined) {
    if (!Number.isInteger(Number(nextStyleId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'styleId must be an integer when provided'
      })
    }
    updates.style_id = Number(nextStyleId)
  }

  if (typeof nextToRadio === 'string') {
    if (!nextToRadio.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'toRadio cannot be empty when provided'
      })
    }
    updates.to_radio = nextToRadio
  }

  if (!Object.keys(updates).length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide at least one field to update'
    })
  }

  updates.updated_at = new Date().toISOString()

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('qsl_cards')
    .update(updates)
    .eq('card_number', cardNumber)
    .select('id, card_number, style_id, to_radio, created_at, updated_at')
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
      statusMessage: 'Failed to update card',
      data: error.message
    })
  }

  return data
})
