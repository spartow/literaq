'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import {
  FileText,
  Home,
  Library,
  Users,
  PenTool,
  MessageSquare,
  Search,
  Lightbulb,
  Type,
  Quote,
  Zap,
  Shield,
  Plus,
  LogOut,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Agents', href: '/assistant', icon: Users },
];

const aiToolsItems: NavItem[] = [
  { name: 'Smart Writer', href: '/write', icon: PenTool },
  { name: 'Document Chat', href: '/chat', icon: MessageSquare },
  { name: 'Research Review', href: '/assistant', icon: Search },
  { name: 'Topic Discovery', href: '/search', icon: Lightbulb },
  { name: 'Citation Builder', href: '/citations', icon: Quote },
  { name: 'Data Extraction', href: '/assistant', icon: Zap },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeSection, setActiveSection] = useState<'main' | 'ai-tools' | 'research'>('main');
  const [showMenu, setShowMenu] = useState(false);
  const [showCreditsDropdown, setShowCreditsDropdown] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FileText className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">Literaq</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Link href="/">
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Plus className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-900">New Chat</span>
          </button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        {/* Main Navigation */}
        {mainNavItems
          .filter((item) => {
            // Hide Library for non-authenticated users
            if (item.name === 'Library' && !user) {
              return false;
            }
            return true;
          })
          .map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 pb-2">
          <div className="h-px bg-gray-200" />
        </div>

        {/* AI Tools */}
        {aiToolsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}

      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="p-1 hover:bg-red-50 rounded transition-colors group"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
