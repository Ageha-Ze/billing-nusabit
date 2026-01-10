import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import { ToasterConfig } from '@/lib/toast'
import OfflineQueueIndicator from '@/components/OfflineQueueIndicator'
import UIWrapper from '@/components/UIWrapper'
import Sidebar from '@/components/Sidebar'

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
          <Sidebar />
          <UIWrapper>
            <div className="transition-all duration-300 pt-20 ml-64">
              <main className="p-6 animate-fade-in-up">
                {children}
              </main>
            </div>
          </UIWrapper>
        </UserProvider>
        <ToasterConfig />
        <OfflineQueueIndicator />
      </body>
    </html>
  )
}
