import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FanFiles',
  description: 'Share and monetize your content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="container mx-auto py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
