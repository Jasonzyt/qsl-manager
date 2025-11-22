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

  const { error } = await client
    .from('qsl_card_styles')
    .delete()
    .eq('id', styleId)
    .select('id')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Style not found'
      })
    }

    // 23503 is a Postgres foreign key violation (style is in use)
    if (error.code === '23503') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot delete style while cards reference it'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete style',
      data: error.message
    })
  }

  return { success: true }
})
