import { createError, defineEventHandler, getQuery } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const query = getQuery(event)
  const search = typeof query.q === 'string' ? query.q.trim() : ''
  const cardNumberParam = query.cardNumber ?? query.card_number
  const styleIdParam = query.styleId ?? query.style_id
  const toRadioParam = typeof query.toRadio === 'string' ? query.toRadio.trim() : query.to_radio
  const limitParam = Number(query.limit ?? 20)
  const offsetParam = Number(query.offset ?? 0)
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20
  const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0

  const builder = client
    .from('qsl_cards')
    .select('id, card_number, style_id, to_radio, created_at, updated_at', {
      count: 'exact'
    })
    .order('card_number', { ascending: true })

  let queryBuilder = builder

  if (search) {
    queryBuilder = queryBuilder.ilike('to_radio', `%${search}%`)
  }

  if (cardNumberParam !== undefined) {
    const cardNumber = Number(cardNumberParam)
    if (Number.isInteger(cardNumber)) {
      queryBuilder = queryBuilder.eq('card_number', cardNumber)
    }
  }

  if (styleIdParam !== undefined) {
    const styleId = Number(styleIdParam)
    if (Number.isInteger(styleId)) {
      queryBuilder = queryBuilder.eq('style_id', styleId)
    }
  }

  if (toRadioParam) {
    queryBuilder = queryBuilder.ilike('to_radio', `%${toRadioParam}%`)
  }
  const from = offset
  const to = offset + limit - 1

  const { data, error, count } = await queryBuilder.range(from, to)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch cards',
      data: error.message
    })
  }

  return {
    items: data || [],
    total: count ?? 0,
    limit,
    offset
  }
})
