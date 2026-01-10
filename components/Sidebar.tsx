"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ChevronDown,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  DollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
  Database,
  Package,
  Building2
} from "lucide-react";
import { logout } from '@/app/login/actions';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Database,
    label: 'Master Data',
    children: [
      { label: 'User', href: '/master/user' },
      { label: 'Produk', href: '/master/produk' },
      { label: 'Client', href: '/master/client' },
      { label: 'Kas', href: '/master/kas' },
    ],
  },
  {
    icon: DollarSign,
    label: 'Keuangan',
    children: [
      { label: 'Subscription', href: '/keuangan/subscription' },
      { label: 'Invoice', href: '/keuangan/invoice' },
      { label: 'Payment', href: '/keuangan/payment' },
      { label: 'Transaksi Harian', href: '/keuangan/transaksiharian' },
    ],
  },
  {
    icon: TrendingUp,
    label: 'Laporan',
    children: [
      { label: 'Invoice Report', href: '/laporan/invoice' },
      { label: 'Cash Flow', href: '/laporan/cashflow' },
    ],
  },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string[]>(['Master Data', 'Keuangan']);
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();

  const toggleMenu = (label: string) => {
    setExpandedMenu(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.label === 'Master Data') {
      return user?.role === 'ADMIN';
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 z-50 w-full navbar-modern">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/dashboard" className="flex ml-2 md:mr-24">
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Nusabit Billing
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || 'User'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen pt-20 transition-transform sidebar-modern",
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
        )}
      >
        <div className="h-full px-3 pb-16 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {filteredMenuItems.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className="sidebar-item-modern w-full justify-between group"
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                        <span className="flex-1 ml-3 text-left whitespace-nowrap">{item.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          expandedMenu.includes(item.label) && "rotate-180"
                        )}
                      />
                    </button>
                    {expandedMenu.includes(item.label) && (
                      <ul className="sidebar-submenu-modern">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "sidebar-submenu-item-modern",
                                isActive(child.href) && "bg-blue-50 text-blue-700"
                              )}
                            >
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    className={cn(
                      "sidebar-item-modern",
                      isActive(item.href!) && "sidebar-item-active-modern"
                    )}
                  >
                    <item.icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                    <span className="ml-3">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Logout Button at Bottom */}
          <div className="absolute bottom-4 left-3 right-3">
            <button onClick={handleLogout} className="sidebar-item-modern w-full text-red-600 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div
        className={cn(
          "transition-all duration-300 pt-20",
          sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        {/* Content will be rendered here by layout */}
      </div>
    </>
  );
}