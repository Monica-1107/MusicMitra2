import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
import { processWithDemucs } from '../services/demucsService';

interface FileUploadProps {
  onFilesSelected: (files: { original: File; instrumental: File }) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isLoading }) => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/')) {
        setOriginalFile(file);
      } else {
        alert("Please upload a valid audio file.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!originalFile) return;
    
    setIsProcessing(true);
    try {
      const instrumentalFile = await processWithDemucs(originalFile);
      onFilesSelected({ original: originalFile, instrumental: instrumentalFile });
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Upload Your Song</h2>
          <p className="text-slate-400">Upload the original song to generate lyrics</p>
        </div>

        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            originalFile ? 'border-green-500/20 bg-green-500/5' : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            {originalFile ? (
              <>
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-slate-200">{originalFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(originalFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOriginalFile(null)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md transition-colors"
                  >
                    Change File
                  </button>
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-200">Drag & drop your song here</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse files</p>
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md cursor-pointer transition-colors"
                >
                  Select Audio File
                </label>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!originalFile || isLoading || isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            originalFile && !isLoading && !isProcessing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Processing Audio...
            </div>
          ) : (
            'Generate Lyrics'
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;