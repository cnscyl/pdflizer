
// 1. Özetleme Fonksiyonu (Mevcut yapın, mode parametreli)
export const summarizeText = async (text: string, mode: string = 'short') => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "models/gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY eksik. .env.local içinde tanımlayın.");
  }

// lib/gemini.ts içindeki ilgili kısım

let instruction = "";
  
if (mode === 'short') {
  instruction = "Aşağıdaki metni en kritik 3-5 madde ile çok kısa ve öz bir şekilde Türkçe özetle. Markdown listesi kullan.";
} else if (mode === 'detailed') {
  instruction = "Aşağıdaki metni çok detaylı bir şekilde Türkçe analiz et. Giriş, ana başlıklar, teknik terimler ve sonuç bölümlerini içeren kapsamlı bir yapı kur.";
} else if (mode === 'actions') {
  instruction = "Aşağıdaki metinden çıkarılabilecek somut aksiyonları, yapılması gerekenleri ve varsa önemli tarihleri listeleyerek bir Eylem Planı oluştur.";
} else if (mode === 'transcript') {
  instruction = `
    SEN ÜST DÜZEY BİR YÖNETİM KURULU ANALİSTİSİN. 
    Transkripti oku ve "Yönetici Özeti" formatında, sadece en kritik noktaları rapora dök.

    LÜTFEN ŞU KURALLARA KESİN OLARAK UY:
    1. RADİKAL ÖZETLEME: Selamlaşma, teknik kontroller, onay cümleleri ve önemsiz diyalogları tamamen ele. Sadece ana gündemleri ve alınan sonuçları yaz.
    2. ÜÇÜNCÜ ŞAHIS VE RESMİ DİL: "Belirtmiştir", "İfade etmiştir", "Kararlaştırılmıştır" şeklinde profesyonel bir dil kullan.
    3. KRİTİK GÖRÜŞLER: Sadece konunun gidişatını değiştiren Sn. [İsim Surname] görüşlerini tek birer cümle ile belirt.
    4. NET KARARLAR: Her gündem maddesinin sonunda varsa alınan kararı "Karar:" başlığıyla kalınlaştırarak yaz.

    FORMAT KURALLARI:
    - ANA BAŞLIK için sadece "# " kullan. (Örn: # TOPLANTI TUTANAĞI)
    - GÜNDEM BAŞLIKLARI için sadece "## " kullan. (Örn: ## 1. ÇEYREK BÜTÇE ANALİZİ)
    - ASLA HTML kodu veya yıldız (*) kullanma. Sadece düz metin, # ve ## kullan.`;
}
  return callGemini(text, instruction, apiKey, model);
};

// 2. YENİ: Soru-Cevap Fonksiyonu (Chat özelliği için)
export const askQuestion = async (text: string, question: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "models/gemini-2.5-flash";

  if (!apiKey) throw new Error("GEMINI_API_KEY eksik.");

  const instruction = `
    Sen bir doküman asistanısın. Aşağıda sana verilen metne dayanarak kullanıcıdan gelen soruyu yanıtla.
    Kurallar:
    1. Yanıtı sadece metne dayanarak ver.
    2. Eğer yanıt metinde yoksa, bunu kibarca belirt.
    3. Yanıtı Türkçe, net ve kısa ver.
    
    SORU: ${question}`;

  return callGemini(text, instruction, apiKey, model);
};

// 3. Ortak Gemini Çağrı Yapısı (Kod tekrarını önlemek için)
async function callGemini(text: string, instruction: string, apiKey: string, model: string) {
  const payload = {
    contents: [{
      parts: [{
        text: `${instruction}\n\nMETİN: \n\n${text.substring(0, 30000)}`
      }]
    }]
  };

  const endpoints = [
    `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`
  ];

  let lastError: string | undefined;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        const out = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!out) throw new Error("Metin alınamadı.");
        return out;
      }
      lastError = data?.error?.message ?? `HTTP ${response.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      continue;
    }
  }
  throw new Error(`Gemini hatası: ${lastError}`);
}