'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { TaskBuilder } from '@/components/task-builder';
import { ChatbotWidget } from '@/components/chatbot-widget';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreditsDropdown, setShowCreditsDropdown] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/papers/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      // Navigate to paper page
      router.push(`/papers/${data.paperId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative">
        {/* AI-Powered Badge - Top Center */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-medium text-indigo-700">AI-Powered Research Assistant</span>
          </div>
        </div>

        {/* Hamburger Menu - Top Right */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={() => setShowCreditsDropdown(!showCreditsDropdown)}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {showCreditsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
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

              {/* Quick Actions */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="space-y-1">
                  <Link href="/assistant" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setShowCreditsDropdown(false)}>
                    <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Review Literature</span>
                  </Link>
                  <Link href="/search" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setShowCreditsDropdown(false)}>
                    <div className="w-5 h-5 bg-pink-500 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Search Papers</span>
                  </Link>
                  <Link href="/write" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setShowCreditsDropdown(false)}>
                    <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Write a Draft</span>
                  </Link>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link href="/pricing" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setShowCreditsDropdown(false)}>
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">Pricing</span>
                </Link>
                {!isSignedIn && (
                  <>
                    <Link href="/sign-in" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setShowCreditsDropdown(false)}>
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Sign In</span>
                    </Link>
                    <Link href="/sign-up" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all mt-2" onClick={() => setShowCreditsDropdown(false)}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="text-sm font-semibold">Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full px-8 py-8 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Transform Your Research<br />with Intelligent AI Assistance
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Describe your research goal below and let Literaq&apos;s AI handle the heavy lifting - from data analysis to paper summaries, we&apos;ve got you covered.
          </p>
        </div>

        {/* AI Prompt Input */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 backdrop-blur-sm bg-white/90">
            <textarea
              placeholder="What would you like help with today? Describe your research task..."
              className="w-full min-h-[80px] px-3 py-2 text-gray-900 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 resize-none text-sm"
            />
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <label className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </label>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">All</span>
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Enhanced Search</span>
                </button>
              </div>
              <button className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>


        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 mt-6">
          <Link href="/library" className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-5 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity mx-auto"></div>
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Quick Upload</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Drop your PDF and start getting insights immediately - no complicated setup required
            </p>
          </Link>
          <Link href="/assistant" className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-5 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 w-10 h-10 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity mx-auto"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 w-10 h-10 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Intelligent Processing</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our AI instantly understands your documents using advanced machine learning
            </p>
          </Link>
          <Link href="/chat" className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-5 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 w-10 h-10 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity mx-auto"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 w-10 h-10 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Conversational AI</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Get precise answers to your research questions through natural conversation
            </p>
          </Link>
        </div>
        </div>
      </main>
      
      {/* Floating Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
