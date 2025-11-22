import { createError, defineEventHandler, readBody } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

type StyleUpdatePayload = {
  styleName?: string
  style_name?: string
}

export default defineEventHandler(async (event) => {
  const styleId = Number(event.context.params?.id)

  if (!Number.isInteger(styleId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'style id must be an integer'
    })
  }

  const body = (await readBody(event)) as StyleUpdatePayload
  const styleName = body.styleName ?? body.style_name

  if (!styleName || typeof styleName !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'styleName (string) is required'
    })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('qsl_card_styles')
    .update({ style_name: styleName })
    .eq('id', styleId)
    .select('id, style_name, created_at')
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
      statusMessage: 'Failed to update style',
      data: error.message
    })
  }

  return data
})
