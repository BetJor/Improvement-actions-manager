import "./globals.css"
import { Inter } from 'next/font/google'
import { getMessages, getLocale } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { AuthProvider } from "@/hooks/use-auth"
import { ProtectedLayout } from "@/components/protected-layout"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: { locale: string };
}) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ProtectedLayout>
              {children}
            </ProtectedLayout>
            <Toaster />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
