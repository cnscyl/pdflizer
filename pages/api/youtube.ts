import type { NextApiRequest, NextApiResponse } from 'next';
import { summarizeText } from '../../lib/gemini';

// Kütüphaneyi tip güvenliği ile birlikte dinamik olarak içeri alıyoruz
const { YoutubeTranscript } = require('youtube-transcript');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { url, mode } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Lütfen bir YouTube linki girin." });
  }

  try {
    // 1. YouTube transkriptini çek
    // ESM/CommonJS çakışmasını önlemek için YoutubeTranscript.fetchTranscript kullanıyoruz
    const transcriptConfig = await YoutubeTranscript.fetchTranscript(url);
    
    if (!transcriptConfig || transcriptConfig.length === 0) {
      throw new Error("Transkript bulunamadı.");
    }

    const fullText = transcriptConfig.map((t: any) => t.text).join(' ');

    // 2. Gemini ile analiz et
    const summary = await summarizeText(fullText, mode || 'transcript');

    return res.status(200).json({ summary });
  } catch (error: any) {
    console.error("YouTube Analiz Hatası:", error);
    return res.status(500).json({ 
      error: "Video analizi yapılamadı. Muhtemelen videonun alt yazıları kapalı veya bu video transkript alınmasına izin vermiyor." 
    });
  }
}