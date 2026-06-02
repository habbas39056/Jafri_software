'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Factory, 
  Truck, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  BarChart3,
  Settings,
  Wallet,
  UserCog,
  LogOut,
  Calculator
} from 'lucide-react';

import { getActiveUser, setActiveUser, Employee } from '@/lib/mockDb';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [activeUser, setActiveUserLocal] = useState<Employee | null>(null);
  
  useEffect(() => {
    setActiveUserLocal(getActiveUser());
  }, []);

  const allNavItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
    { label: 'Production', href: '/production', icon: Factory },
    { label: 'Delivery', href: '/delivery', icon: Truck },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Cashbook', href: '/cashbook', icon: Wallet },
    { label: 'Warranty', href: '/warranties', icon: ShieldCheck },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  // Filter items based on user role and assigned modules
  const navItems = allNavItems.filter(item => {
    if (!activeUser) return false;
    if (activeUser.role === 'Admin') return true;
    return activeUser.modules.includes(item.label);
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        }}>
          <Factory size={22} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.125rem', lineHeight: 1.2 }}>JAFRI & CO</span>
          <span style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.1em' }}>ERP SYSTEM</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="nav-group">
          <p className="nav-label">Main Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {activeUser?.role === 'Admin' && (
            <>
              <Link href="/hr" className={`nav-link ${pathname === '/hr' ? 'active' : ''}`}>
                <Calculator size={18} />
                <span>HR Module</span>
              </Link>
              <Link href="/employees" className={`nav-link ${pathname === '/employees' ? 'active' : ''}`}>
                <UserCog size={18} />
                <span>Employees</span>
              </Link>
              <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </>
          )}
          <button 
            className="nav-link" 
            style={{ marginTop: '0.5rem', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onClick={() => {
              setActiveUser(null);
              window.location.href = '/login';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
