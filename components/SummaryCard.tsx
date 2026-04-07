import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  BrainCircuit, 
  MessageSquare, 
  SendHorizontal, 
  Bot, 
  Loader2,
  Download,
  FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SummaryCardProps {
  summary: string;
  isLoading?: boolean;
}

export default function SummaryCard({ summary, isLoading }: SummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatAnswer, isChatLoading]);

  // --- PDF İNDİRME (İzolasyon Yöntemi - lab hatasını çözer) ---
  const handleDownloadPDF = async () => {
    const element = document.getElementById('analysis-content');
    if (!element) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: [15, 15] as [number, number],
        filename: `Analiz_Raporu_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          backgroundColor: '#ffffff',
          // KRİTİK: Klon dökümandaki tüm Tailwind/Modern CSS'leri temizle
          onclone: (clonedDoc: Document) => {
            // 1. Tüm mevcut stilleri sil (lab/oklch renkleri burada barınıyor)
            const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(s => s.remove());

            // 2. PDF için sadece basit HEX kodları içeren yeni bir stil enjekte et
            const styleTag = clonedDoc.createElement('style');
            styleTag.innerHTML = `
              #analysis-content {
                font-family: Arial, sans-serif !important;
                color: #1e293b !important;
                padding: 20px !important;
                background: #ffffff !important;
              }
              h1 { font-size: 22pt !important; color: #0f172a !important; margin-bottom: 15px !important; font-weight: bold !important; }
              h2 { font-size: 16pt !important; color: #1e293b !important; margin-top: 20px !important; border-left: 4px solid #3b82f6 !important; padding-left: 10px !important; font-weight: bold !important; }
              p, li { font-size: 11pt !important; line-height: 1.6 !important; color: #334155 !important; margin-bottom: 8px !important; }
              ul { padding-left: 20px !important; }
              strong { font-weight: bold !important; color: #000000 !important; }
              * { box-shadow: none !important; text-shadow: none !important; border-color: #cbd5e1 !important; }
            `;
            clonedDoc.head.appendChild(styleTag);
          }
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Hatası:", err);
      alert("PDF oluşturulamadı. Lütfen metin (TXT) olarak indirmeyi deneyin.");
    }
  };

  const handleDownloadTXT = async () => {
    try {
      const { saveAs } = await import('file-saver');
      const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `Analiz_Notu_${new Date().getTime()}.txt`);
    } catch (err) {
      console.error("TXT Hatası:", err);
    }
  };

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
    setChatAnswer(''); 

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfText: summary, question: question }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Cevap alınamadı");
      setChatAnswer(data.answer);
      setQuestion(''); 
    } catch (err) {
      setChatAnswer("Üzgünüm, şu an yanıtlayamıyorum.");
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm ring-1 ring-slate-200/70 border border-slate-100 flex flex-col h-full min-h-[600px] transition-all relative overflow-hidden">
      
      {/* Başlık ve İndirme Menüsü */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ring-1 ${isLoading ? "bg-blue-600 animate-pulse ring-blue-600/20" : "bg-blue-600/10 ring-blue-600/15"}`}>
            <Sparkles size={20} className={isLoading ? "text-white" : "text-blue-700"} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Analiz Raporu</h2>
            <p className="text-[10px] text-blue-600/90 font-bold uppercase tracking-widest mt-0.5">Pdflizer v2.0</p>
          </div>
        </div>

        {summary && !isLoading && (
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadTXT} className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all ring-1 ring-slate-200" title="Metin İndir">
              <FileText size={16} />
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-5 py-3 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">
              <Download size={14} /> PDF İNDİR
            </button>
            <button onClick={handleCopy} className={`p-3 rounded-2xl transition-all ring-1 ${copied ? "bg-green-500 text-white ring-green-600" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        {isLoading ? (
          <div className="space-y-4 animate-in fade-in duration-500">
             <div className="flex items-center space-x-3 mb-6">
              <BrainCircuit className="text-blue-500 animate-spin" size={20} />
              <span className="text-sm font-medium text-slate-500">Veriler işleniyor...</span>
            </div>
            <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-slate-50 rounded-full w-[90%] animate-pulse delay-75"></div>
          </div>
        ) : summary ? (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <article id="analysis-content" className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium mb-10">
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
            <div className="mt-12 pt-8 border-t border-slate-100 space-y-6 bg-slate-50/30 -mx-4 px-4 pb-4 rounded-b-[2.5rem]">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <MessageSquare size={18} className="text-indigo-600" /> İçeriğe Soru Sor
              </div>
              <div className="relative">
                <input 
                  type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Bu dökümanda ne anlatılıyor?"
                  className="w-full bg-white border border-slate-200 rounded-[1.25rem] px-5 py-4 pr-14 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                />
                <button onClick={handleAskQuestion} disabled={isChatLoading || !question.trim()} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 transition-all">
                  {isChatLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                </button>
              </div>

              {(isChatLoading || chatAnswer) && (
                <div className="bg-white border border-blue-100 p-5 rounded-[1.5rem] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                    <Bot size={14} /> AI Yanıtı
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed font-medium prose-sm prose-slate">
                    <ReactMarkdown>{chatAnswer}</ReactMarkdown>
                  </div>
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
             <p className="text-slate-900 font-bold text-lg">Hemen Başlayın</p>
          </div>
        )}
      </div>
    </div>
  );
}