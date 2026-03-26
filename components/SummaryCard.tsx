import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  BrainCircuit, 
  MessageSquare, // Eğer MessageSquareSend hata veriyorsa bunu kullanabilirsin
  SendHorizontal, 
  Bot, 
  Loader2 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';



interface SummaryCardProps {
  summary: string;
  isLoading?: boolean;
}

export default function SummaryCard({ summary, isLoading }: SummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Chat State'leri
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Yeni cevap geldiğinde otomatik aşağı kaydır
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatAnswer, isChatLoading]);

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

  const handleAskQuestion = async () => {
    if (!question.trim() || !summary || isChatLoading) return;

    setIsChatLoading(true);
    setChatAnswer(''); // Yeni soru için eski cevabı temizle

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pdfText: summary, // Şimdilik özet üzerinden soruyoruz, index.tsx'ten fullText gelirse onu bağlayabilirsin
          question: question 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Cevap alınamadı");
      
      setChatAnswer(data.answer);
      setQuestion(''); // Soruyu temizle
    } catch (err) {
      console.error("Chat Hatası:", err);
      setChatAnswer("Üzgünüm, bu soruyu şu an yanıtlayamıyorum.");
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm ring-1 ring-slate-200/70 border border-slate-100 flex flex-col h-full min-h-[600px] transition-all relative overflow-hidden">
      
      {/* Başlık Alanı */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ring-1 ${isLoading ? "bg-blue-600 animate-pulse ring-blue-600/20" : "bg-blue-600/10 ring-blue-600/15"}`}>
            <Sparkles size={20} className={isLoading ? "text-white" : "text-blue-700"} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isLoading ? "Analiz Ediliyor..." : "AI Analiz Raporu"}
            </h2>
            <p className="text-[10px] text-blue-600/90 font-bold uppercase tracking-widest mt-0.5">
              {isLoading ? "Neural Processing" : "Smart Insights"}
            </p>
          </div>
        </div>

        {summary && !isLoading && (
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-2xl transition-all active:scale-95 shadow-sm ${
              copied 
                ? "bg-green-500 text-white shadow-green-200" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 ring-1 ring-slate-200"
            }`}
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
            {copied ? "Kopyalandı!" : "Kopyala"}
          </button>
        )}
      </div>

      {/* İçerik Alanı */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        {isLoading ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <BrainCircuit className="text-blue-500 animate-spin" size={20} />
              <span className="text-sm font-medium text-slate-500">Gemini dokümanı tarıyor...</span>
            </div>
            <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-slate-50 rounded-full w-[90%] animate-pulse delay-75"></div>
            <div className="h-4 bg-slate-50 rounded-full w-[40%] animate-pulse delay-150"></div>
          </div>
        ) : summary ? (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium">
              <ReactMarkdown 
                components={{
                  p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                  strong: ({children}) => <strong className="font-bold text-slate-950 underline decoration-blue-100 decoration-2 underline-offset-2">{children}</strong>,
                  ul: ({children}) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                  li: ({children}) => <li className="marker:text-blue-500">{children}</li>,
                  h1: ({children}) => <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-bold text-slate-900 mt-6 mb-3 tracking-tight border-l-4 border-blue-500 pl-3">{children}</h2>,
                }}
              >
                {summary}
              </ReactMarkdown>
            </article>

            {/* Chat Bölümü */}
            <div className="mt-12 pt-8 border-t border-slate-100 space-y-6">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <MessageSquare size={18} />
                </div>
                <span className="text-sm font-bold tracking-tight">Dokümana Soru Sor</span>
              </div>

              <div className="relative group">
                <input 
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Bu belgede bahsedilen riskler neler?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 py-4 pr-14 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                <button 
                  onClick={handleAskQuestion}
                  disabled={isChatLoading || !question.trim()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md active:scale-95"
                >
                  {isChatLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                </button>
              </div>

              {/* Chat Cevap Alanı */}
              {(isChatLoading || chatAnswer) && (
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-[1.5rem] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                    <Bot size={14} className="animate-bounce" /> AI Yanıtı
                  </div>
                  {isChatLoading ? (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                      {chatAnswer}
                    </p>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
             <div className="relative w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-inner">
                <Sparkles size={40} className="text-slate-200" />
             </div>
             <div>
                <p className="text-slate-900 font-bold text-lg">Hemen Başlayın</p>
                <p className="text-slate-400 text-xs max-w-[220px] mx-auto mt-2 leading-relaxed font-medium">
                  PDF dosyanızı yükleyin ve Gemini'nin dokümanınızı saniyeler içinde analiz etmesini izleyin.
                </p>
             </div>
          </div>
        )}
      </div>

      {/* Footer Etiketi */}
      {!isLoading && summary && (
        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>System Online • Gemini 2.5 Flash</span>
          </div>
          <span>{summary.length} Veri Bloğu</span>
        </div>
      )}
    </div>
  );
}