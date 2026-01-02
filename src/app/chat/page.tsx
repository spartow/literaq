'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Upload, FileText, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { PageHeader } from '@/components/page-header';

export default function DocumentChatPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

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

      // Navigate to paper page with chat
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
      <AppSidebar />

      <main className="flex-1 overflow-y-auto relative">
        <PageHeader />
        <div className="max-w-4xl mx-auto px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Document Chat
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload a research paper and start an intelligent conversation with AI about its contents
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-16 text-center transition-all duration-300 ${
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
                      Processing your document...
                    </p>
                    <p className="text-sm text-gray-600">
                      Extracting text, generating embeddings, and preparing for chat.
                      This may take a minute.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-2xl blur-2xl opacity-30 mx-auto"></div>
                    <Upload className="relative w-20 h-20 text-indigo-600 mx-auto" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl font-semibold text-gray-900">
                      Drop your PDF here
                    </p>
                    <p className="text-base text-gray-600">
                      or click the button below to browse
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      Maximum file size: 10MB
                    </div>
                  </div>
                  <label className="inline-block group">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <span className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <Upload className="w-5 h-5" />
                      Select PDF File
                    </span>
                  </label>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-600">
                Get instant insights and summaries from your research papers
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Natural Conversation</h3>
              <p className="text-sm text-gray-600">
                Ask questions in plain language and get precise answers
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Citation Support</h3>
              <p className="text-sm text-gray-600">
                Get references to specific sections and page numbers
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
