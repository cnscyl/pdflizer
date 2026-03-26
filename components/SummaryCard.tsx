import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // 1. Importu ekledik

interface SummaryCardProps {
  summary: string;
  isLoading?: boolean;
}

export default function SummaryCard({ summary, isLoading }: SummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Kopyalama başarısız:", err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm ring-1 ring-slate-200/70 border border-slate-100 flex flex-col h-full min-h-[550px] transition-all">
      {/* Başlık Alanı */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ring-1 ${isLoading ? "bg-blue-600 animate-pulse ring-blue-600/20" : "bg-blue-600/10 ring-blue-600/15"}`}>
            <Sparkles size={20} className={isLoading ? "text-white" : "text-blue-700"} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isLoading ? "Analiz Ediliyor..." : "Analiz Sonucu"}
            </h2>
            <p className="text-[10px] text-blue-600/90 font-bold uppercase tracking-widest mt-0.5">
              {isLoading ? "AI Is Processing" : "AI Insights"}
            </p>
          </div>
        </div>

        {summary && !isLoading && (
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-2xl transition-all active:scale-95 shadow-lg ${
              copied 
                ? "bg-green-500 text-white shadow-green-200" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none ring-1 ring-slate-200"
            }`}
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
            {copied ? "Kopyalandı!" : "Metni Kopyala"}
          </button>
        )}
      </div>

      {/* İçerik Alanı */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <BrainCircuit className="text-blue-500 animate-spin" size={20} />
              <span className="text-sm font-medium text-slate-500">Gemini dokümanı tarıyor...</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-slate-100 rounded-full w-[90%] animate-pulse"></div>
            <div className="h-4 bg-slate-100 rounded-full w-[40%] animate-pulse"></div>
          </div>
        ) : summary ? (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            {/* 2. Düz metin yerine Markdown bileşenini kullandık */}
            <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium">
              <ReactMarkdown 
                components={{
                  // Markdown içindeki özel yapıları Tailwind ile şıklaştıralım
                  p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                  strong: ({children}) => <strong className="font-bold text-slate-950 underline decoration-blue-200 decoration-2 underline-offset-2">{children}</strong>,
                  ul: ({children}) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                  li: ({children}) => <li className="marker:text-blue-500">{children}</li>,
                  h1: ({children}) => <h1 className="text-2xl font-bold text-slate-900 mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">{children}</h2>,
                }}
              >
                {summary}
              </ReactMarkdown>
            </article>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-50 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-24 h-24 bg-white rounded-3xl shadow-inner border border-slate-100 flex items-center justify-center">
                <Sparkles size={40} className="text-slate-300" />
              </div>
            </div>
            <div>
              <p className="text-slate-800 font-bold text-lg tracking-tight">Akıllı Özet Sistemi</p>
              <p className="text-slate-400 text-sm max-w-[250px] mx-auto mt-2 leading-relaxed">
                Henüz bir veri işlenmedi. Sol taraftan dokümanınızı yükleyerek analizi başlatın.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alt Bilgi */}
      {!isLoading && summary && (
        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Gemini 2.5 Flash Engine</span>
          </div>
          <span>{summary.length} Karakter</span>
        </div>
      )}
    </div>
  );
}