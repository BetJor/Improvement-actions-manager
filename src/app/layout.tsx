"use client";

import "./globals.css"
import { Inter } from 'next/font/google'
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { AppContent } from "@/components/app-content";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="ca">
      <body className={inter.className}>
          <AuthProvider>
            <AppContent>
              {children}
            </AppContent>
            <Toaster />
          </AuthProvider>
      </body>
    </html>
  )
}
