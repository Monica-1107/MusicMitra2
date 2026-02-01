export const processWithDemucs = async (audioFile: File): Promise<File> => {
  const formData = new FormData();
  formData.append('file', audioFile);

  try {
    const response = await fetch('http://localhost:8000/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process audio with Demucs');
    }

    // Get the processed audio file
    const blob = await response.blob();
    return new File([blob], 'instrumental.wav', { type: 'audio/wav' });
  } catch (error) {
    console.error('Error processing with Demucs:', error);
    throw error;
  }
};
