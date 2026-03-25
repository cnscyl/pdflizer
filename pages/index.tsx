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
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white text-slate-900 font-sans">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur border-b border-slate-100/70 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-slate-900 to-blue-600 p-2.5 rounded-2xl shadow-inner ring-1 ring-slate-900/10">
                <Sparkles size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter text-slate-950">
                Pdflizer
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Gücünü</span>
              <span className="font-bold text-slate-900">Gemini AI</span>
              <span className="text-slate-400">alır</span>
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
                  <h2 className="text-lg font-bold text-slate-950">Doküman Yükle</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Özetlemek istediğin PDF dosyasını buraya sürükle veya seç.
                  </p>
                </div>
                <Uploader onSummaryResult={setSummary} onLoading={setLoading} />
              </div>
              
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-blue-700 text-xs flex items-center gap-3 shadow-sm">
                 <div className="bg-blue-600/10 p-2 rounded-lg text-blue-700 ring-1 ring-blue-600/15">
                    <Sparkles size={16} className="text-blue-700" />
                 </div>
                 <p className="flex-1">
                   Şu an deneysel <span className="font-bold">Gemini 2.5 Flash</span> modeli kullanılmaktadır.
                   Karakter sınırı 20k'dır.
                 </p>
              </div>
            </div>

            {/* Sağ Sütun: Özet Kartı */}
            <div className="md:col-span-2">
              <SummaryCard summary={summary} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Home;