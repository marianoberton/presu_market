'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, ClipboardList, Home } from 'lucide-react';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Presupuestador', href: '/presupuestador', icon: Calculator },
  { name: 'Encuestas', href: '/encuestas', icon: ClipboardList },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Image 
          src="/MARKET-PAPER-LOGO-CURVAS_Mesa-de-trabajo-1-3-e1726845431314-1400x571 (1).png" 
          alt="Market Paper" 
          width={120}
          height={32}
          className="h-8 w-auto bg-white p-1 rounded"
        />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
