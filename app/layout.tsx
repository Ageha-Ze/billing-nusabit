import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import { ToasterConfig } from '@/lib/toast'
import OfflineQueueIndicator from '@/components/OfflineQueueIndicator'
import LayoutContent from '@/components/LayoutContent'

export const metadata: Metadata = {
  title: 'Nusabit Billing',
  description: 'Billing and Invoicing Management System for Nusabit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50">
        <UserProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </UserProvider>
        <ToasterConfig />
        <OfflineQueueIndicator />
      </body>
    </html>
  )
}
