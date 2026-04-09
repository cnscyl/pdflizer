# 🧠 DeepNode AI

DeepNode, **OpenAI GPT-4o** motoruyla güçlendirilmiş; karmaşık toplantı transkriptlerini, videoları ve PDF dökümanlarını profesyonel yönetim kurulu raporlarına dönüştüren üst düzey bir analiz platformudur.

![DeepNode Analysis](https://img.shields.io/badge/AI-OpenAI%20GPT--4o-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge)

## ✨ Öne Çıkan Özellikler

- **Kurumsal Katip Modu:** Transkriptleri üçüncü şahıs anlatımıyla, konuşmacı referanslı (`Sn. İsim`) resmi tutanaklara dönüştürür.
- **Akıllı Karar Mekanizması:** Toplantıdaki kritik kararları otomatik tespit eder ve görsel indigo kutular içinde vurgular.
- **Hiyerarşik Görsel Kimlik:**
  - `#` **Lacivert (Slate-950):** Ana Rapor Başlığı
  - `##` **Mor (Indigo-600):** Gündem Maddeleri ve Ana Konular
  - `###` **Mavi (Blue-600):** Detaylı Alt Başlıklar
- **Hibrit Analiz:** PDF dökümanları, MP4 video transkriptleri ve Markdown dosyalarını saniyeler içinde işler.
- **İnteraktif Soru-Cevap:** Analiz edilen döküman hakkında AI asistanı ile canlı sohbet imkanı sunar.
- **Profesyonel Export:** Raporları kurumsal standartlarda **PDF** veya **TXT** formatında dışa aktarır.

## 🚀 Kurulum ve Çalıştırma

### 1. Projeyi Klonlayın
```bash
git clone [https://github.com/cnscyl/pdflizer.git](https://github.com/cnscyl/pdflizer.git)
cd pdflizer

### 2. API Yapılandırması
Ana dizinde `.env.local` dosyası oluşturun ve OpenAI API anahtarınızı ekleyin:

> ⚠️ Not: Güvenlik nedeniyle bu dosya **GitHub'a yüklenmemelidir.**

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Uygulamayı Başlatın
```bash
npm run dev
```

Ardından tarayıcınızdan şu adrese gidin:

👉 http://localhost:3000

---

## 🛠️ Teknik Yığın (Tech Stack)

- **Core:** Next.js (App Router), TypeScript  
- **AI Engine:** OpenAI GPT-4o API  
- **Styling:** Tailwind CSS, Lucide Icons  
- **Markdown:** React-Markdown  
- **PDF Engine:** Html2pdf.js, PDF.js  

---

## 📝 Notlar

- 🔐 **Güvenlik:** API anahtarınızın `.gitignore` dosyasında listelendiğinden emin olun.  
- 📄 **Format:** En iyi sonuçlar için toplantı kayıtlarında konuşmacı isimlerinin net olması önerilir.  
