'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <div className={isLogin ? 'login-layout' : 'layout-wrapper'}>
      {!isLogin && <Sidebar />}
      <main className={isLogin ? 'login-main-content' : 'main-content'}>
        {children}
      </main>
    </div>
  );
}
