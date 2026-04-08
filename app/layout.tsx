import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/cockpit/ThemeProvider'
import { SpaceProvider } from '@/components/cockpit/SpaceContext'
import { Toaster } from 'sonner'

const inter = Inter({ variable: '--font-inter', subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Кокпит',
  description: 'Персональный веб-дашборд',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `(function(){try{var t=localStorage.getItem('cockpit-theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`}} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SpaceProvider>
            {children}
          </SpaceProvider>
        </ThemeProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
