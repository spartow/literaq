'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
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
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'My Library', href: '/library', icon: Library },
  { name: 'Agent Gallery', href: '/assistant', icon: Users },
];

const aiToolsItems: NavItem[] = [
  { name: 'Smart Writer', href: '/write', icon: PenTool },
  { name: 'Document Chat', href: '/chat', icon: MessageSquare },
  { name: 'Research Review', href: '/assistant?tool=literature-review', icon: Search },
  { name: 'Topic Discovery', href: '/search', icon: Lightbulb },
  { name: 'Text Rewriter', href: '/assistant?tool=paraphrase', icon: Type },
  { name: 'Citation Builder', href: '/assistant?tool=citation', icon: Quote },
  { name: 'Data Extraction', href: '/assistant?tool=extract-data', icon: Zap },
  { name: 'Content Detector', href: '/assistant?tool=ai-detector', icon: Shield },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">LITERAQ</span>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
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
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {/* Main Navigation */}
        {mainNavItems.map((item) => {
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
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
