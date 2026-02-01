import { z } from 'zod'

export const LyricsAPIResponseModel = z.object({
  lyrics: z.string(),
  lyrics_id: z.string(),
  snippet: z.string(),
  copyright: z.string(),
  has_lyrics: z.string()
})

export const LyricsModel = z.object({
  lyrics: z.string(),
  lyricsId: z.string(),
  snippet: z.string(),
  copyright: z.string().nullable(),
  hasLyrics: z.boolean()
})

export type LyricsAPIResponse = z.infer<typeof LyricsAPIResponseModel>
export type Lyrics = z.infer<typeof LyricsModel> 