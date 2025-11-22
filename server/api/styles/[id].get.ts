import { createError, defineEventHandler } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const styleId = Number(event.context.params?.id)

  if (!Number.isInteger(styleId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'style id must be an integer'
    })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('qsl_card_styles')
    .select('id, style_name, created_at')
    .eq('id', styleId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Style not found'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch style',
      data: error.message
    })
  }

  return data
})
