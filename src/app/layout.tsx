import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster";
import {NextIntlClientProvider, useMessages} from 'next-intl';
import { Inter } from 'next/font/google'
import { getLocale } from "next-intl/server";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ 
  children,
}: { 
  children: React.ReactNode,
}) {
  const messages = useMessages();
  const locale = getLocale();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <AppSidebar />
            <div className="flex flex-col">
              <Header />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background/60">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
