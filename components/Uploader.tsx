import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, FileText, X, Sparkles, Loader2 } from 'lucide-react';

interface UploaderProps {
  onSummaryResult: (summary: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function Uploader({ onSummaryResult, onLoading }: UploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dosya seçimi ve doğrulama için ortak fonksiyon
  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Lütfen sadece PDF dosyası yükleyin.');
      setFile(null);
      return;
    }
    // Dosya boyutu kontrolü (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan büyük olamaz.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  // Input üzerinden dosya seçimi
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // Sürükle-Bırak Fonksiyonları
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  // API'ye yükleme ve analiz süreci
  const handleUpload = async () => {
    if (!file) return;

    onSummaryResult('');
    setIsLoading(true);
    onLoading(true); // Üst bileşene yükleniyor bilgisini gönder
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Dosya yüklenirken bir hata oluştu.');
      }

      onSummaryResult(data.summary);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
      onLoading(false); // Üst bileşene yükleme bitti bilgisini gönder
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError('');
    onSummaryResult('');
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-3xl px-6 py-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
            isDragging 
              ? "border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg shadow-blue-100" 
              : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 shadow-sm"
          }`}
        >
          <div className={`p-4 rounded-2xl mb-4 border transition-all duration-300 ${
            isDragging ? "bg-blue-100 border-blue-200" : "bg-white border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100"
          }`}>
            <UploadCloud 
              size={32} 
              className={`transition-colors duration-300 ${isDragging ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"}`} 
            />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-800">
              {isDragging ? "Dosyayı Buraya Bırak" : "PDF Dosyasını Seç veya Sürükle"}
            </p>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Maksimum 10MB</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600 border border-blue-100/50">
            <FileText size={24} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
            <p className="text-xs font-semibold text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={removeFile}
            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-xs font-bold px-4 py-3 rounded-2xl border border-red-100 animate-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file || isLoading}
        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-black transition-all duration-300 shadow-lg active:scale-95 ${
          !file || isLoading
            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200/50"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>ANALİZ EDİLİYOR...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} className="text-white opacity-80" />
            <span>ÖZETİ OLUŞTUR</span>
          </>
        )}
      </button>
    </div>
  );
}