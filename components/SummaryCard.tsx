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

  // Yıldızları temizleyen ve metni normalize eden yardımcı
  const formatContent = (text: string) => {
    if (!text) return "";
    return text.replace(/\*/g, '').trim();
  };

  // PDF İNDİRME
  const handleDownloadPDF = async () => {
    const element = document.getElementById('analysis-content');
    if (!element) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [15, 15] as [number, number],
        filename: `DeepNode_Analiz_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Hatası:", err);
    }
  };

  const handleDownloadTXT = async () => {
    try {
      const { saveAs } = await import('file-saver');
      const cleanText = formatContent(summary);
      const blob = new Blob([cleanText], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `DeepNode_Notu_${new Date().getTime()}.txt`);
    } catch (err) {
      console.error("TXT Hatası:", err);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(formatContent(summary));
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
      setChatAnswer(data.answer);
      setQuestion(''); 
    } catch (err) {
      setChatAnswer("Cevap alınamadı.");
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm ring-1 ring-slate-200/70 border border-slate-100 flex flex-col h-full min-h-[600px] transition-all relative overflow-hidden">
      
      {/* BAŞLIK VE AKSİYONLAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ring-1 ${isLoading ? "bg-indigo-600 animate-pulse ring-indigo-600/20" : "bg-indigo-600/10 ring-indigo-600/15"}`}>
            <Sparkles size={20} className={isLoading ? "text-white" : "text-indigo-700"} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight italic">DeepNode Analiz Raporu</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Intelligence Core v2.5</p>
          </div>
        </div>

        {summary && !isLoading && (
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadTXT} className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all ring-1 ring-slate-200">
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

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <BrainCircuit className="text-indigo-500 animate-spin" size={20} />
              <span className="text-sm font-medium text-slate-500 tracking-tight italic">DeepNode veriyi işliyor...</span>
            </div>
            <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-slate-50 rounded-full w-[90%] animate-pulse delay-75"></div>
            <div className="h-4 bg-slate-50 rounded-full w-[40%] animate-pulse delay-150"></div>
          </div>
        ) : summary ? (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <article id="analysis-content" className="prose prose-slate max-w-none mb-10">
              <ReactMarkdown 
                components={{
                  // ANA BAŞLIK: LACİVERT
                  h1: ({children}) => (
                    <h1 className="text-3xl font-black text-[#0f172a] mb-10 mt-6 tracking-tight border-b-8 border-indigo-600/20 pb-4 uppercase italic">
                      {children}
                    </h1>
                  ),
                  // GÜNDEM BAŞLIKLARI: MOR
                  h2: ({children}) => (
                    <h2 className="text-xl font-[900] text-[#4f46e5] mt-12 mb-6 tracking-tighter flex items-center gap-3 italic bg-indigo-50/70 p-4 rounded-xl border-l-[12px] border-[#4f46e5] shadow-sm uppercase">
                      <div className="w-3 h-3 bg-[#4f46e5] rounded-full animate-pulse flex-shrink-0" />
                      {children}
                    </h2>
                  ),
                  // ALT BAŞLIKLAR: MAVİ
                  h3: ({children}) => (
                    <h3 className="text-lg font-extrabold text-[#2563eb] mt-10 mb-4 tracking-tight flex items-center gap-2.5 italic border-l-4 border-[#2563eb] pl-3 py-1">
                      <div className="w-2 h-2 bg-[#2563eb] rounded-full flex-shrink-0" />
                      {children}
                    </h3>
                  ),
                  // PARAGRAFLAR, Sn. VE Karar:
                  p: ({children}) => {
                    const text = String(children);
                    const isSpeaker = text.startsWith("Sn.");
                    const isDecision = text.startsWith("Karar:");

                    return (
                      <p className={`mb-4 leading-relaxed font-medium text-[15px] ${
                        isSpeaker ? "text-slate-900 font-bold border-l-4 border-slate-200 pl-4 py-1 mt-6" : 
                        isDecision ? "text-[#4f46e5] font-black bg-indigo-50/80 p-4 rounded-lg border-2 border-indigo-100 mt-6 shadow-inner" : 
                        "text-slate-600 pl-5"
                      }`}>
                        {children}
                      </p>
                    );
                  },
                  strong: ({children}) => <strong className="font-bold text-slate-950">{children}</strong>,
                  ul: ({children}) => <ul className="list-none pl-0 space-y-3 mb-8">{children}</ul>,
                  li: ({children}) => <li className="flex items-start gap-3 border-l-2 border-indigo-100 pl-4 py-1 hover:border-indigo-500 transition-colors">{children}</li>,
                }}
              >
                {formatContent(summary)}
              </ReactMarkdown>
            </article>

            {/* CHAT BÖLÜMÜ */}
            <div className="mt-12 pt-8 border-t border-slate-100 space-y-6 bg-slate-50/30 -mx-4 px-4 pb-4 rounded-b-[2.5rem]">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm italic">
                <MessageSquare size={18} className="text-indigo-600" /> DeepNode Soru-Cevap
              </div>
              <div className="relative">
                <input 
                  type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Rapor hakkında soru sor..."
                  className="w-full bg-white border border-slate-200 rounded-[1.25rem] px-5 py-4 pr-14 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm italic"
                />
                <button onClick={handleAskQuestion} disabled={isChatLoading || !question.trim()} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                  {isChatLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                </button>
              </div>

              {chatAnswer && (
                <div className="bg-white border border-indigo-100 p-5 rounded-[1.5rem] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-3 text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
                    <Bot size={14} /> Intelligence Response
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed font-medium">
                    <ReactMarkdown>{formatContent(chatAnswer)}</ReactMarkdown>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
            <BrainCircuit size={40} className="text-slate-200" />
            <p className="text-slate-900 font-bold text-lg italic tracking-tight">DeepNode Analyze Core</p>
          </div>
        )}
      </div>

      {!isLoading && summary && (
        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>DeepNode Neural Link Active</span>
          </div>
          <span>{summary.length} DATA BLOCKS</span>
        </div>
      )}
    </div>
  );
}