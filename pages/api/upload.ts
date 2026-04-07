import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { summarizeText } from '../../lib/gemini';
import mammoth from 'mammoth'; // Word desteği için

// @ts-ignore
const pdf = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    await runMiddleware(req, res, upload.single('file'));
    const fileRequest = req as any;
    const file = fileRequest.file;

    if (!file) return res.status(400).json({ message: 'Dosya yok' });

    const mode = fileRequest.body.mode || 'short';
    const fileName = file.originalname.toLowerCase();
    let extractedText = "";

    // --- DOSYA TİPİNE GÖRE AYRIŞTIRMA ---
    
    if (fileName.endsWith('.pdf')) {
      // PDF İşleme
      if (!pdf || !pdf.PDFParse) throw new Error("pdf-parse hatası");
      const parser = new pdf.PDFParse({
        data: file.buffer,
        verbosity: pdf.VerbosityLevel?.ERRORS ?? 0,
      });
      try {
        const data = await parser.getText();
        extractedText = data.text;
      } finally {
        await parser.destroy();
      }
    } 
    else if (fileName.endsWith('.docx')) {
      // Word (.docx) İşleme
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    } 
    else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      // Hem .txt hem de .md dosyalarını düz metin olarak oku
      extractedText = file.buffer.toString('utf8');
    }
    else {
      return res.status(400).json({ message: 'Sadece PDF, DOCX ve TXT dosyaları desteklenir.' });
    }

    // Metin kontrolü
    if (!extractedText || extractedText.trim().length < 5) {
      throw new Error("Dosya içeriği okunamadı veya boş.");
    }

    // Gemini'ye Gönder
    const summary = await summarizeText(extractedText, mode);
    
    return res.status(200).json({ summary });

  } catch (error: any) {
    console.error("Hata Detayı:", error);
    return res.status(500).json({ message: 'İşlem sırasında hata oluştu', error: error.message });
  }
}