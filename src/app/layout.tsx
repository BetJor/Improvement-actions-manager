
import "./globals.css"
import { Inter } from 'next/font/google'
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { getLocale, getMessages } from "next-intl/server"
import { NextIntlClientProvider } from 'next-intl'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children
}: {
  children: React.ReactNode  
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
