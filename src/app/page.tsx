'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { TaskBuilder } from '@/components/task-builder';
import { ChatbotWidget } from '@/components/chatbot-widget';
import { PageHeader } from '@/components/page-header';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'all' | 'enhanced'>('all');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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

      if (!response.ok) {
        let errorMessage = 'Failed to upload file';
        try {
          const data = await response.json();
          errorMessage = data?.error || data?.message || errorMessage;
        } catch {
          errorMessage = `Upload failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data || !data.paperId) {
        throw new Error('Invalid response from server');
      }

      // Navigate to paper page
      router.push(`/papers/${data.paperId}`);
    } catch (err) {
      console.error('Upload error:', err);
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
        <PageHeader />

        <div className="w-full px-8 py-8 pt-16">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Transform Your Research<br />with Intelligent AI Assistance
          </h1>
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
                <div className="relative">
                  <button 
                    onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">{searchType === 'all' ? 'All' : 'Papers'}</span>
                    <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSearchDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button 
                        onClick={() => { setSearchType('all'); setShowSearchDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                      >
                        All
                      </button>
                      <button 
                        onClick={() => { setSearchType('enhanced'); setShowSearchDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                      >
                        Papers Only
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => router.push('/search')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
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
