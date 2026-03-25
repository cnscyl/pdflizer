export const summarizeText = async (text: string) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL ?? "models/gemini-2.5-flash";

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY eksik. .env.local içinde tanımlayın.");
    }

    // Önce v1beta'yı, hata verirse v1'i deneyecek bir yapı kuralım
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`
    ];
  
    const payload = {
      contents: [{
        parts: [{
          text: `Aşağıdaki metni çok detaylı bir şekilde Türkçe özetle. 
Özeti hazırlarken şu yapıya sadık kal:
1. Kapsamlı bir giriş cümlesi.
2. Ana başlıklar ve bu başlıkların altında yatan önemli alt detaylar (bullet points kullanarak).
3. Metindeki teknik terimler, önemli veriler veya kritik vurgular.
4. Sonuç veya genel değerlendirme.

Metin: \n\n${text.substring(0, 20000)}`
        }]
      }]
    };
  
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
          if (!out) throw new Error("Gemini yanıtından metin alınamadı.");
          return out;
        }

        lastError = data?.error?.message ?? `HTTP ${response.status} ${response.statusText}`;
        console.log(`Gemini başarısız: ${response.status} - ${lastError}`);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        continue;
      }
    }

    throw new Error(`Gemini generateContent başarısız. Son hata: ${lastError ?? "bilinmiyor"}`);
};