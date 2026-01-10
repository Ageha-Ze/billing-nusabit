"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import UIWrapper from '@/components/UIWrapper';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith('/login');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <UIWrapper>
        <div className="transition-all duration-300 pt-20 ml-64">
          <main className="p-6 animate-fade-in-up">
            {children}
          </main>
        </div>
      </UIWrapper>
    </>
  );
}
