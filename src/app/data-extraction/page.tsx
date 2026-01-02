'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { PageHeader } from '@/components/page-header';
import { Database, Zap, Download, FileText } from 'lucide-react';

export default function DataExtractionPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const extractData = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch('/api/assistant/extract-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to extract data. Please try again.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Data extraction error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Request timed out. Please try a simpler query.');
      } else {
        alert('Failed to extract data. Please check your connection and try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />

      <div className="flex-1 overflow-y-auto relative">
        <PageHeader />
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Data Extraction</h1>
              </div>
              <button
                onClick={() => router.push('/assistant')}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                ← Back to tools
              </button>
            </div>
            <p className="text-gray-600">Pull structured data from research papers</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Extract Structured Data
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What data do you need?
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Extract all methodology sections from papers about COVID-19"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={extractData}
                disabled={!query.trim() || isSearching}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Database className="w-5 h-5" />
                {isSearching ? 'Extracting...' : 'Extract Data'}
              </button>
            </div>

            {results.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Extracted Data</h3>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                <div className="space-y-2">
                  {results.map((result, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      {JSON.stringify(result)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example Queries */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Example Queries:</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setQuery('Extract research methodologies from machine learning papers')}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  Extract research methodologies from machine learning papers
                </button>
                <button
                  onClick={() => setQuery('Pull statistical results from clinical trials')}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  Pull statistical results from clinical trials
                </button>
                <button
                  onClick={() => setQuery('Extract author affiliations and institutions')}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  Extract author affiliations and institutions
                </button>
                <button
                  onClick={() => setQuery('Get all cited references from papers')}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  Get all cited references from papers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
