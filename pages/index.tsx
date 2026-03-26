import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Uploader from '../components/Uploader';
import SummaryCard from '../components/SummaryCard';
import { Sparkles } from 'lucide-react';

const Home: NextPage = () => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>Pdflizer | Gemini ile PDF'ini Konuştur</title>
        <meta name="description" content="PDF dosyalarınızı Gemini AI ile saniyeler içinde özetleyin." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white text-slate-900 font-sans">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/70 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-gradient-to-br from-slate-900 to-blue-600 p-2.5 rounded-2xl shadow-lg ring-1 ring-slate-900/10 group-hover:scale-105 transition-transform">
                <Sparkles size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter text-slate-950">
                Pdflizer
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 hidden sm:inline">Gücünü</span>
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">
                <span className="font-bold text-slate-900 text-xs">Gemini AI</span>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </nav>
        </header>

        {/* Ana İçerik Alanı */}
        <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* Sol Sütun: Dosya Yükleme */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white/90 p-6 rounded-3xl shadow-sm ring-1 ring-slate-200/70 border border-white transition-all hover:shadow-md">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    Doküman Yükle
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Özetlemek istediğin PDF dosyasını buraya sürükle veya seç.
                  </p>
                </div>
                
                {/* Uploader bileşenine onLoading prop'unu bağladık */}
                <Uploader onSummaryResult={setSummary} onLoading={setLoading} />
              </div>
              
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-blue-700 text-xs flex items-center gap-3 shadow-sm animate-in fade-in duration-1000">
                 <div className="bg-blue-600/10 p-2 rounded-lg text-blue-700 ring-1 ring-blue-600/15">
                    <Sparkles size={16} className="text-blue-700" />
                 </div>
                 <p className="flex-1 leading-relaxed">
                   Şu an deneysel <span className="font-bold">Gemini 2.5 Flash</span> modeli kullanılmaktadır. 
                   Hızlı ve akıllı analizler için optimize edildi.
                 </p>
              </div>
            </div>

            {/* Sağ Sütun: Özet Kartı */}
            <div className="md:col-span-2">
              {/* SummaryCard'a hem summary hem de loading durumunu gönderiyoruz */}
              <SummaryCard summary={summary} isLoading={loading} />
            </div>
          </div>
        </main>

        {/* Basit Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
            © 2026 Pdflizer AI • PDF Analiz Platformu
          </p>
        </footer>
      </div>
    </>
  );
};

export default Home;