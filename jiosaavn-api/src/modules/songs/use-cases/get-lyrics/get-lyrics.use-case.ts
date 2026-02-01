import { useFetch } from '#common/helpers'
import { Endpoints } from '#common/constants'
import { createLyricsPayload } from '#modules/songs/helpers/lyrics.helper'
import { LyricsAPIResponseModel, LyricsModel } from '#modules/songs/models/lyrics.model'
import type { z } from 'zod'

export interface GetLyricsArgs {
  lyricsId: string
}

export class GetLyricsUseCase {
  async execute(args: GetLyricsArgs): Promise<z.infer<typeof LyricsModel>> {
    const { lyricsId } = args

    const response = await useFetch<z.infer<typeof LyricsAPIResponseModel>>({
      endpoint: Endpoints.songs.lyrics,
      params: {
        lyrics_id: lyricsId
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch lyrics')
    }

    const validatedData = LyricsAPIResponseModel.parse(response.data)
    return createLyricsPayload(validatedData)
  }
} 