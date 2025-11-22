import { createError, defineEventHandler, readBody } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

type StylePayload = {
  id?: number
  styleId?: number
  style_id?: number
  styleName?: string
  style_name?: string
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as StylePayload

  const styleId = body.styleId ?? body.style_id ?? body.id
  const styleName = body.styleName ?? body.style_name

  if (!styleName || typeof styleName !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'styleName (string) is required'
    })
  }

  const insertPayload: { id?: number; style_name: string } = {
    style_name: styleName
  }

  if (styleId !== undefined) {
    if (!Number.isInteger(Number(styleId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'styleId must be an integer when provided'
      })
    }
    insertPayload.id = Number(styleId)
  }

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('qsl_card_styles')
    // Cast to any to satisfy TS inference with untyped DB schema.
    .insert([insertPayload] as any)
    .select('id, style_name, created_at')
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create style' + (error.message ? `: ${error.message}` : ''),
      data: error.message
    })
  }

  return data
})
