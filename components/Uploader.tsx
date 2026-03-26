import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, FileText, X, Sparkles, Loader2, ListChecks, Target, BookOpen } from 'lucide-react';

interface UploaderProps {
  onSummaryResult: (summary: string) => void;
  onLoading: (loading: boolean) => void;
}

// Analiz derinliği seçenekleri
const ANALISIS_MODES = [
  { id: 'short', label: 'Hızlı Özet', icon: Target, desc: 'En kritik 3-5 madde' },
  { id: 'detailed', label: 'Detaylı Analiz', icon: BookOpen, desc: 'Kapsamlı ve veriye dayalı' },
  { id: 'actions', label: 'Eylem Planı', icon: ListChecks, desc: 'Yapılması gerekenler odaklı' },
];

export default function Uploader({ onSummaryResult, onLoading }: UploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState('short'); // Varsayılan mod
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Lütfen sadece PDF dosyası yükleyin.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan büyük olamaz.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    onSummaryResult('');
    setIsLoading(true);
    onLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', selectedMode); // Seçilen modu API'ye gönderiyoruz

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analiz sırasında bir hata oluştu.');
      }

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
    onSummaryResult('');
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileSelection(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-[2.5rem] px-6 py-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
            isDragging 
              ? "border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg shadow-blue-100" 
              : "border-slate-200 bg-slate-50 hover:border-blue-400 shadow-sm"
          }`}
        >
          <div className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm transition-transform group-hover:scale-110">
            <UploadCloud size={30} className="text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700">PDF Sürükle veya Seç</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Max 10MB</p>
          </div>
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} accept="application/pdf" className="hidden" />
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
          {/* Seçili Dosya Kartı */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 border border-blue-100/50">
              <FileText size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{file.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={removeFile} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Analiz Modu Seçimi (LLM İçin) */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Analiz Derinliği</span>
            <div className="grid grid-cols-1 gap-2">
              {ANALISIS_MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left ${
                      isSelected 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-blue-200"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? "bg-white/20" : "bg-slate-50 text-blue-600"}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>{mode.label}</p>
                      <p className={`text-[10px] font-medium ${isSelected ? "text-blue-100" : "text-slate-400"}`}>{mode.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-[10px] font-bold p-3 rounded-2xl border border-red-100 text-center animate-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file || isLoading}
        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 ${
          !file || isLoading
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200/50"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>ANALİZ BAŞLADI...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} className="text-white opacity-80" />
            <span>ANALİZİ BAŞLAT</span>
          </>
        )}
      </button>
    </div>
  );
}