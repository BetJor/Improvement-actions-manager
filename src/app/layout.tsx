import './globals.css';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/components/app-provider';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gestor de Acciones de Mejora',
  description: 'Gestiona y sigue las acciones de mejora en toda tu organización.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
