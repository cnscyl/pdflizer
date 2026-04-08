import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Uploader from '../components/Uploader';
import SummaryCard from '../components/SummaryCard';
import { Sparkles } from 'lucide-react';

const Home: NextPage = () => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Yeni yükleme başladığında eski özeti temizleyen fonksiyon
  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
    if (isLoading) {
      setSummary(''); // Yeni dosya geldiği an eskiyi siler
    }
  };

  return (
    <>
      <Head>
        <title>DeepNode | OpenAI ile PDF'ini Konuştur</title>
        <meta name="description" content="PDF dosyalarınızı OpenAI AI ile saniyeler içinde özetleyin." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white text-slate-900 font-sans">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/70 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-600 p-2.5 rounded-2xl shadow-lg ring-1 ring-slate-900/10 group-hover:scale-105 transition-transform">
                <Sparkles size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter text-slate-950">
                DeepNode
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 hidden sm:inline">Güçlü Analizler</span>
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">
                <span className="font-bold text-slate-900 text-xs tracking-tight">OpenAI GPT-4o</span>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
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
                    Özetlemek istediğin dosyayı (PDF, MP4, MD) buraya sürükle veya seç.
                  </p>
                </div>
                
                {/* Yükleme başladığında handleLoading tetiklenir */}
                <Uploader 
                  onSummaryResult={setSummary} 
                  onLoading={handleLoading} 
                />
              </div>
              

            </div>

            {/* Sağ Sütun: Özet Kartı */}
            <div className="md:col-span-2">
              {/* SummaryCard'a 'key' ekleyerek her yeni yüklemede 
                  bileşenin tamamen 'reset'lenmesini sağlıyoruz.
              */}
              <SummaryCard 
                key={summary ? summary.substring(0, 20) : 'empty'}
                summary={summary} 
                isLoading={loading} 
              />
            </div>
          </div>
        </main>

        <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
            © 2026 DeepNode AI • Kurumsal Analiz Platformu
          </p>
        </footer>
      </div>
    </>
  );
};

export default Home;