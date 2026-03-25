import React, { useState, useRef, ChangeEvent } from 'react';
import { UploadCloud, FileText, X, Sparkles } from 'lucide-react';

interface UploaderProps {
  onSummaryResult: (summary: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function Uploader({ onSummaryResult, onLoading }: UploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Lütfen sadece PDF dosyası yükleyin.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    onSummaryResult('');
    setIsLoading(true);
    onLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Dosya yüklenirken bir hata oluştu.');
      }

      const data = await response.json();
      onSummaryResult(data.summary);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError('');
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/30 group"
        >
          <div className="bg-slate-100 p-4 rounded-xl mb-4 border border-slate-200 group-hover:bg-blue-50 transition-colors">
            <UploadCloud size={28} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-sm font-semibold text-slate-800">PDF Dosyasını Seç</p>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Maksimum dosya boyutu 10MB.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-600">
            <FileText size={20} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={removeFile}
            className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">
          {error}
        </p>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file || isLoading}
        className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold transition-all shadow-md active:scale-95 ${
          !file || isLoading
            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200/70"
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Analiz Ediliyor...
          </>
        ) : (
          <>
            <Sparkles size={18} className="text-blue-400" />
            Özeti Oluştur
          </>
        )}
      </button>
    </div>
  );
}