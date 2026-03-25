import type { AppProps } from 'next/app';
// Aşağıdaki satırda oluşturduğun CSS dosyasının yolunu kontrol et
import './global.css'; 

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

