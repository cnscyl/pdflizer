export const summarizeText = async (text: string, mode: string = 'short') => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "models/gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY eksik. .env.local içinde tanımlayın.");
  }

  // --- MODA GÖRE TALİMATLARI BELİRLEME ---
  let instruction = "";
  
  if (mode === 'short') {
    instruction = `
      Aşağıdaki metni en kritik 3-5 madde ile çok kısa ve öz bir şekilde Türkçe özetle. 
      Sadece en önemli noktaları vurgula, detaylara girme.
      Markdown listesi kullan.`;
  } else if (mode === 'detailed') {
    instruction = `
      Aşağıdaki metni çok detaylı bir şekilde Türkçe analiz et. 
      Şu yapıya sadık kal:
      1. Kapsamlı bir giriş cümlesi.
      2. Ana başlıklar ve alt detaylar (bullet points).
      3. Teknik terimler ve kritik vurgular.
      4. Sonuç veya genel değerlendirme.`;
  } else if (mode === 'actions') {
    instruction = `
      Aşağıdaki metni analiz ederek "Eylem Planı" oluştur. 
      Şu yapıya sadık kal:
      1. Metinden çıkarılabilecek somut aksiyonlar (Yapılması gerekenler).
      2. Varsa önemli tarihler, isimler veya görev dağılımları.
      3. Dikkat edilmesi gereken riskler veya uyarılar.`;
  }

  const payload = {
    contents: [{
      parts: [{
        text: `${instruction}\n\nMetin: \n\n${text.substring(0, 25000)}`
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
        if (!out) throw new Error("Gemini yanıtından metin alınamadı.");
        return out;
      }

      lastError = data?.error?.message ?? `HTTP ${response.status} ${response.statusText}`;
      console.log(`Gemini denemesi başarısız: ${url.split('/')[3]} - ${lastError}`);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      continue;
    }
  }

  throw new Error(`Gemini generateContent başarısız. Son hata: ${lastError ?? "bilinmiyor"}`);
};