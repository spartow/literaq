'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';

export default function ParaphrasePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [style, setStyle] = useState('Academic Style');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, style }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to paraphrase');
      }

      const data = await response.json();
      setOutputText(data.paraphrasedText);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to paraphrase text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />
      
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Paraphraser</h1>
            <p className="text-gray-600 mt-2">Rewrite text in academic style</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Original Text</h3>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Academic Style</option>
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Creative</option>
                </select>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to paraphrase..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">{inputText.length} characters</span>
                <button
                  onClick={handleParaphrase}
                  disabled={!inputText.trim() || isProcessing}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  {isProcessing ? 'Processing...' : 'Paraphrase'}
                </button>
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Paraphrased Text</h3>
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              <div className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto">
                {outputText ? (
                  <p className="text-gray-900 whitespace-pre-wrap">{outputText}</p>
                ) : (
                  <p className="text-gray-400">Paraphrased text will appear here...</p>
                )}
              </div>
              {outputText && (
                <div className="mt-4">
                  <span className="text-sm text-gray-600">{outputText.length} characters</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
