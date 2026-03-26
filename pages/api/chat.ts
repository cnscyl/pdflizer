import type { NextApiRequest, NextApiResponse } from 'next';
import { askQuestion } from '../../lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { pdfText, question } = req.body;

  if (!pdfText || !question) {
    return res.status(400).json({ error: "Eksik veri: Metin veya soru yok." });
  }

  try {
    // lib/gemini.ts içindeki yeni fonksiyonu çağırıyoruz
    const answer = await askQuestion(pdfText, question);
    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error("Chat API Hatası:", error);
    return res.status(500).json({ error: error.message });
  }
}