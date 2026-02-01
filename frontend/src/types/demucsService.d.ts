// frontend/src/types/demucsService.d.ts
declare module '../services/demucsService' {
  export const processWithDemucs: (audioFile: File) => Promise<File>;
}