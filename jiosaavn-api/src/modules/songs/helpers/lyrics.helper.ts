import type { LyricsAPIResponseModel, LyricsModel } from '#modules/songs/models/lyrics.model'
import type { z } from 'zod'

export const createLyricsPayload = (lyrics: z.infer<typeof LyricsAPIResponseModel>): z.infer<typeof LyricsModel> => ({
  lyrics: lyrics.lyrics,
  lyricsId: lyrics.lyrics_id,
  snippet: lyrics.snippet,
  copyright: lyrics.copyright || null,
  hasLyrics: lyrics.has_lyrics === 'true'
}) 