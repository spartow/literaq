'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export function PageHeader() {
  const { isSignedIn, user } = useUser();
  const [showCreditsDropdown, setShowCreditsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCreditsDropdown(false);
      }
    }

    if (showCreditsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreditsDropdown]);

  return (
    <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
      {/* Pricing Button */}
      <Link href="/pricing" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Pricing
      </Link>

      {!isSignedIn ? (
        <>
          {/* Sign In Button */}
          <Link href="/sign-in" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </Link>

          {/* Sign Up Button */}
          <Link href="/sign-up" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Sign Up
          </Link>
        </>
      ) : (
        <>
          {/* My Account for signed-in users */}
          <Link href="/library" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Account
          </Link>
        </>
      )}

      {/* Hamburger Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowCreditsDropdown(!showCreditsDropdown)}
          className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {showCreditsDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[calc(100vh-100px)] overflow-y-auto">
            {/* Credits Section - Only for signed in users */}
            {isSignedIn && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">100 Credits</span>
                  </div>
                </div>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Plan</span>
                    <span className="text-sm font-semibold text-gray-900">Basic</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Credits Remaining</span>
                    <span className="text-lg font-bold text-gray-900">100 left</span>
                  </div>
                </div>
              </div>
            )}

            {/* I WANT TO Section */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">I Want To</h3>
              <div className="grid grid-cols-1 gap-1">
                <Link href="/assistant" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-blue-500">📚</span>
                  <span className="text-gray-700">Review Literature</span>
                </Link>
                <Link href="/write" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-red-500">✏️</span>
                  <span className="text-gray-700">Write a Draft</span>
                </Link>
                <Link href="/assistant" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-blue-600">📊</span>
                  <span className="text-gray-700">Generate Diagram</span>
                </Link>
                <Link href="/search" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-pink-500">🔍</span>
                  <span className="text-gray-700">Search Papers</span>
                </Link>
                <Link href="/data-extraction" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-green-600">💾</span>
                  <span className="text-gray-700">Extract Data</span>
                </Link>
              </div>
            </div>

            {/* USE Section */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Use</h3>
              <div className="grid grid-cols-1 gap-1">
                <Link href="/assistant" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-orange-500">🔬</span>
                  <span className="text-gray-700">Deep Review</span>
                </Link>
                <Link href="/search" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-gray-600">📖</span>
                  <span className="text-gray-700">Pubmed</span>
                </Link>
                <Link href="/search" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-blue-600">🎓</span>
                  <span className="text-gray-700">Google Scholar</span>
                </Link>
                <Link href="/search" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-red-600">📄</span>
                  <span className="text-gray-700">ArXiV</span>
                </Link>
                <Link href="/assistant" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-blue-500">🐍</span>
                  <span className="text-gray-700">Python Library</span>
                </Link>
              </div>
            </div>

            {/* MAKE A Section */}
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Make A</h3>
              <div className="grid grid-cols-1 gap-1">
                <Link href="/write" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-blue-600">📝</span>
                  <span className="text-gray-700">Word document</span>
                </Link>
                <Link href="/assistant" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-red-600">📊</span>
                  <span className="text-gray-700">PPT presentation</span>
                </Link>
                <Link href="/write" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-gray-700">📄</span>
                  <span className="text-gray-700">LaTeX Manuscript</span>
                </Link>
                <Link href="/assistant" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-blue-500">📊</span>
                  <span className="text-gray-700">Data Visualisation</span>
                </Link>
                <Link href="/write" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm" onClick={() => setShowCreditsDropdown(false)}>
                  <span className="text-red-600">📑</span>
                  <span className="text-gray-700">PDF Report</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
