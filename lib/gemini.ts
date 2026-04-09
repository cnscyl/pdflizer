import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env.local dosyasında tanımlı olmalı
});

// 1. Özetleme Fonksiyonu
export const summarizeText = async (text: string, mode: string = 'short') => {
  const model = "gpt-4o"; // Radikal özetleme için en zeki model

  let instruction = "";
  
  if (mode === 'short') {
    instruction = "Aşağıdaki metni en kritik 3-5 madde ile çok kısa ve öz bir şekilde Türkçe özetle. ASLA yıldız (*) kullanma.";
  } else if (mode === 'detailed') {
    instruction = `Aşağıdaki dokümanı derinlemesine analiz et. 
        1. ANA BAŞLIK için sadece "# " kullan.
        2. ALT BÖLÜMLER için sadece "## " kullan.
        3. Analizi; Giriş, Teknik Detaylar ve Sonuç bölümlerine ayır.
        4. Profesyonel, üçüncü tekil şahıs dili kullan.
        5. ASLA yıldız (*) veya HTML kullanma.`;
  } else if (mode === 'actions') {
    instruction = `
      Bu metinden somut bir eylem planı oluştur.
      1. ANA BAŞLIK olarak en başa "# EYLEM PLANI" yaz.
      2. Her bir görev/sorun başlığını "## " ile başlat. (Örn: ## BACKEND PERFORMANS)
      3. İçeriği maddeler halinde açıkla. 
      4. Yıldız (*) veya HTML kullanma. Sadece # ve ## kullan.`;
    } else if (mode === 'transcript') {
      instruction = `
        SEN PROFESYONEL BİR YÖNETİM KURULU ANALİSTİSİN. 
        Transkripti analiz et ve tam olarak aşağıdaki yapıya sadık kalarak resmi bir "Toplantı Tutanağı" oluştur.
    
        ANALİZ KURALLARI: Öncelikle toplantı transkripti olup olmadığını kontrol et ve eğer değilse "Bu bir toplantı transkripti değil" diye belirt. Eğer transkript ise aşağıdaki kurallara uygula.
        1. İSİM BAZLI DİYALOG: Görüş bildiren herkesin ismini "Sn. [İsim Soyisim]:" şeklinde belirt.
        2. ÜÇÜNCÜ TEKİL ŞAHIS: Konuşmaları "ifade etmiştir", "belirtmiştir", "vurgulamıştır" gibi kurumsal bir dille anlat.
        3. RADİKAL ÖZETLEME: Selamlaşma, ses kontrolü ve onay cümlelerini (evet, tamam vb.) tamamen ele. Sadece ana gündem konularını ve tartışılan argümanları tut.
        4. KARAR YAPISI: Her gündem maddesinin sonunda bir uzlaşı varsa, bunu diyalogun hemen altına "Karar:" başlığıyla ayrıca ekle.
    
        GÖRSEL VE FORMAT KURALLARI:
        - ANA BAŞLIK (#): En başa "# TOPLANTI TUTANAĞI" yaz (Lacivert görünecek).
        - GÜNDEM BAŞLIKLARI (##): Her yeni konuyu "## [GÜNDEM BAŞLIĞI]" şeklinde büyük harflerle yaz (Mor görünecek).
        - ASLA '*' veya '**' (yıldız) karakteri kullanma.
        - ASLA HTML etiketi (<span...>) kullanma.
        - Konuşmacı isimlerinden sonra mutlaka bir alt satıra geçerek anlatımı başlat.
    
        ÖRNEK DÜZEN:
        ## [KONU BAŞLIĞI]
        Sn. [İsim]:
        [Üçüncü şahıs anlatımıyla özetlenmiş kurumsal cümle.]
    
        Karar: [Alınan net karar cümlesi.]`;
    }

  return callOpenAI(text, instruction, model);
};

// 2. Soru-Cevap Fonksiyonu
export const askQuestion = async (text: string, question: string) => {
  const model = "gpt-4o";
  const instruction = `
    Sen bir doküman asistanısın. Aşağıda sana verilen metne dayanarak kullanıcıdan gelen soruyu yanıtla.
    Kurallar:
    1. Yanıtı sadece metne dayanarak ver.
    2. Eğer yanıt metinde yoksa, bunu kibarca belirt.
    3. Yanıtı Türkçe, net ve kısa ver. ASLA yıldız (*) kullanma.`;

  const prompt = `${instruction}\n\nSORU: ${question}`;
  return callOpenAI(text, prompt, model);
};

// 3. Ortak OpenAI Çağrı Yapısı
async function callOpenAI(text: string, instruction: string, model: string) {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: `METİN: \n\n${text.substring(0, 50000)}` } // GPT-4o context'i daha geniştir
      ],
      temperature: 0.5, // Daha kararlı yanıtlar için
    });

    const out = response.choices[0].message.content;
    
    if (!out) throw new Error("OpenAI'dan yanıt alınamadı.");
    
    // Markdown yıldızlarını temizleyerek SummaryCard ile uyumlu hale getiriyoruz
    return out.replace(/\*/g, '').trim();
  } catch (err: any) {
    console.error("OpenAI Error:", err);
    
    if (err.status === 401) throw new Error("OpenAI API Anahtarı geçersiz.");
    if (err.status === 429) throw new Error("OpenAI Kotası doldu veya bakiye yetersiz.");
    
    throw new Error(`OpenAI Hatası: ${err.message}`);
  }
}