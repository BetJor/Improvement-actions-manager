
import "./globals.css"
import { Inter } from 'next/font/google'
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { ProtectedLayout } from "@/components/protected-layout"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Gestor de Acciones de Mejora",
  description: "Gestiona y sigue las acciones de mejora a toda tu organización.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {

  return (
    <html lang="es">
      <body className={inter.className}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
      </body>
    </html>
  )
}
