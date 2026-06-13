import type { Metadata } from "next"
import { AppShell } from "@/components/layout/AppShell"
import { AuthProvider } from "@/components/auth/AuthContext"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "VentureFlow - Problem-first AI solution builder",
    template: "%s | VentureFlow",
  },
  description: "Problem-first AI solution builder",
  applicationName: "VentureFlow",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
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
