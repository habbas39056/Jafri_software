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
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
    { label: 'Production', href: '/production', icon: Factory },
    { label: 'Delivery', href: '/delivery', icon: Truck },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Warranty', href: '/warranties', icon: ShieldCheck },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
  ];

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

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
