import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default async function LocaleLayout({ 
  children,
  params: {locale}
}: { 
  children: React.ReactNode,
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
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
