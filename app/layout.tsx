import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Talat Booking - Otel Rezervasyon Sistemi',
  description: 'Konforlu konaklama için otel odalarını keşfedin ve rezervasyon yapın. En uygun fiyatlar ve kolay rezervasyon sistemi.',
  keywords: 'otel, rezervasyon, konaklama, tatil, booking',
  authors: [{ name: 'Talat Booking' }],
  openGraph: {
    title: 'Talat Booking - Otel Rezervasyon Sistemi',
    description: 'Konforlu konaklama için otel odalarını keşfedin ve rezervasyon yapın.',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talat Booking - Otel Rezervasyon Sistemi',
    description: 'Konforlu konaklama için otel odalarını keşfedin ve rezervasyon yapın.',
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
