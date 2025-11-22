import { createError, defineEventHandler, readBody } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

type CardPayload = {
  cardNumber?: number
  card_number?: number
  styleId?: number
  style_id?: number
  toRadio?: string
  to_radio?: string
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as CardPayload

  const cardNumber = Number(
    typeof body.cardNumber === 'number' ? body.cardNumber : body.card_number
  )
  const styleId = Number(
    typeof body.styleId === 'number' ? body.styleId : body.style_id
  )
  const toRadio =
    typeof body.toRadio === 'string' ? body.toRadio : (body.to_radio as string)

  if (!Number.isInteger(cardNumber)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'cardNumber (integer) is required'
    })
  }

  if (!Number.isInteger(styleId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'styleId (integer) is required'
    })
  }

  if (!toRadio || typeof toRadio !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'toRadio (string) is required'
    })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('qsl_cards')
    .insert({
      card_number: cardNumber,
      style_id: styleId,
      to_radio: toRadio
    })
    .select('id, card_number, style_id, to_radio, created_at, updated_at')
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create card',
      data: error.message
    })
  }

  return data
})
