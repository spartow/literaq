'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { TaskBuilder } from '@/components/task-builder';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <FileText className="w-20 h-20 text-indigo-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Literaq</h1>
          <p className="text-gray-600">
            Your AI-powered research assistant. Sign in to get started.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/sign-in"
              className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
            >
              Sign In
            </a>
            <a
              href="/sign-up"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-medium text-indigo-700">AI-Powered Research Assistant</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Transform Your Research<br />with Intelligent AI Assistance
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Describe your research goal below and let Literaq&apos;s AI handle the heavy lifting - from data analysis to paper summaries, we&apos;ve got you covered.
          </p>
        </div>

        {/* AI Prompt Input */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-sm bg-white/90">
            <textarea
              placeholder="What would you like help with today? Describe your research task..."
              className="w-full min-h-[120px] px-4 py-3 text-gray-900 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 resize-none text-lg"
            />
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">All</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Enhanced Search</span>
                </button>
              </div>
              <button className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Or start with a document</h3>
            <p className="text-sm text-gray-500">Upload a research paper and ask questions about it</p>
          </div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                : 'border-gray-300 bg-gradient-to-br from-gray-50 to-indigo-50/30 hover:border-indigo-400'
            }`}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-indigo-600 mx-auto animate-spin" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    Processing your paper...
                  </p>
                  <p className="text-sm text-gray-600">
                    Extracting text, generating embeddings, and preparing for chat.
                    This may take a minute.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-indigo-600 mx-auto" />
                <div className="space-y-2">
                  <p className="text-base text-gray-600">
                    Drag and drop your PDF here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Maximum file size: 10MB
                  </p>
                </div>
                <label className="inline-block group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Select PDF File
                  </span>
                </label>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity mx-auto"></div>
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Upload className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Upload</h3>
            <p className="text-gray-600 leading-relaxed">
              Drop your PDF and start getting insights immediately - no complicated setup required
            </p>
          </div>
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 w-14 h-14 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity mx-auto"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Intelligent Processing</h3>
            <p className="text-gray-600 leading-relaxed">
              Our AI instantly understands your documents using advanced machine learning
            </p>
          </div>
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity mx-auto"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
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
            <h3 className="text-lg font-bold text-gray-900 mb-3">Conversational AI</h3>
            <p className="text-gray-600 leading-relaxed">
              Get precise answers to your research questions through natural conversation
            </p>
          </div>
        </div>
        </div>
        </div>
      </main>

      {/* Right Sidebar - Task Builder */}
      <aside className="w-96 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6 z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-xs text-gray-500">Build your research task</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <TaskBuilder />
        </div>
      </aside>
    </div>
  );
}
