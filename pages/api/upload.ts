import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { summarizeText } from '../../lib/gemini';

// @ts-ignore
const pdf = require('pdf-parse');

// NOT: formidable importu tamamen kaldırıldı, multer ile devam ediyoruz.
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
    // Multer dosya ve body alanlarını (mode dahil) ayrıştırır
    await runMiddleware(req, res, upload.single('file'));
    const fileRequest = req as any;

    if (!fileRequest.file) return res.status(400).json({ message: 'Dosya yok' });

    // Uploader.tsx'ten gelen modu yakala
    const mode = fileRequest.body.mode || 'short';

    if (!pdf || !pdf.PDFParse) {
      throw new Error("pdf-parse: PDFParse export bulunamadı");
    }

    const parser = new pdf.PDFParse({
      data: fileRequest.file.buffer,
      verbosity: pdf.VerbosityLevel?.ERRORS ?? 0,
    });

    try {
      const data = await parser.getText();
      if (!data?.text) throw new Error("PDF metni çıkarılamadı");
      
      // summarizeText artık 'mode' parametresini alıyor
      const summary = await summarizeText(data.text, mode);
      
      return res.status(200).json({ summary });
    } finally {
      await parser.destroy();
    }

  } catch (error: any) {
    console.error("Hata Detayı:", error);
    return res.status(500).json({ message: 'Hata', error: error.message });
  }
}