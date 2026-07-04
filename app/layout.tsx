import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AccessibilityProvider } from '@/contexts/accessibility-context'
import { LanguageProvider } from '@/contexts/language-context'
import { StudentsProvider } from '@/contexts/students-context'
import { TeacherProfileProvider } from '@/contexts/teacher-profile-context'
import { AccessibilityMenu } from '@/components/accessibility-menu'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'EDUGUIA - Plataforma de Inclusión Educativa',
  description: 'A comprehensive, high-accessibility educational inclusion platform designed to support students with diverse learning needs through AI-powered assessments, progress tracking, and inclusion tools.',
  generator: 'v0.app',
  keywords: ['education', 'inclusion', 'accessibility', 'special needs', 'AI assessment', 'learning support'],
}

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <AccessibilityProvider>
            <StudentsProvider>
            <TeacherProfileProvider>
            <a href="#main-content" className="skip-link">
              Saltar al contenido principal
            </a>
            {children}
            <AccessibilityMenu />
            </TeacherProfileProvider>
            </StudentsProvider>
          </AccessibilityProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
