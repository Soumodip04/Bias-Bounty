import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth-context'
import { Providers } from '@/components/providers'
import { ResourceProvider } from '@/lib/resource-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BiasBounty - Crowdsourced AI Bias Detection',
  description: 'A platform where the community tests AI models and datasets for bias, earning rewards for finding unfairness.',
  keywords: ['AI', 'bias detection', 'machine learning', 'fairness', 'crowdsourcing'],
  authors: [{ name: 'BiasBounty Team' }],
  openGraph: {
    title: 'BiasBounty - Crowdsourced AI Bias Detection',
    description: 'Join the community in making AI more fair and unbiased',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <ResourceProvider>
              {children}
            </ResourceProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}