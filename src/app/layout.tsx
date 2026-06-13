import type { Metadata } from "next"
import { AppShell } from "@/components/layout/AppShell"
import { AuthProvider } from "@/components/auth/AuthContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "VentureFlow",
  description: "Problem-first AI solution builder",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
