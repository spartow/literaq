'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Search, Download, ExternalLink, FileText, User, Calendar, SlidersHorizontal, Home, Library, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  arxivId: string;
  title: string;
  authors: string;
  abstract: string;
  publicationDate: string;
  doi?: string;
  pdfUrl: string;
  source: string;
}

export default function SearchPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const [maxResults, setMaxResults] = useState(20);
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/search/papers?q=${encodeURIComponent(query)}&sources=arxiv&max=${maxResults}&sort=${sortBy}`
      );
      
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredResults = results.filter((result) => {
    return true; // Can add date filtering here
  });

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Topic Discovery</h1>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-3xl">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search academic papers and research... (e.g., 'neural networks', 'quantum computing')"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Search millions of academic papers and research articles
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Most Recent</option>
                  </select>
                </div>

                {/* Max Results */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Results Per Page
                  </label>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="10">10 papers</option>
                    <option value="20">20 papers</option>
                    <option value="50">50 papers</option>
                    <option value="100">100 papers</option>
                  </select>
                </div>

                {/* Year Filter (Placeholder) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Year
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All years</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {isSearching ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Searching literature database...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Found <span className="font-medium text-gray-900">{filteredResults.length}</span> papers
                {sortBy === 'date' && <span className="ml-2">(sorted by most recent)</span>}
              </div>
            </div>
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start searching for papers
            </h3>
            <p className="text-gray-600">
              Enter keywords, topics, or authors to find research papers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const router = useRouter();

  const handleImport = async () => {
    setIsImporting(true);

    try {
      const res = await fetch('/api/papers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arxivId: result.arxivId,
          title: result.title,
          authors: result.authors,
          abstract: result.abstract,
          publicationDate: result.publicationDate,
          doi: result.doi,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setImported(true);
        
        // Show success message and redirect after delay
        setTimeout(() => {
          router.push(`/papers/${data.paper.id}`);
        }, 1500);
      } else {
        const error = await res.json();
        if (error.paper) {
          // Already imported, go to paper
          router.push(`/papers/${error.paper.id}`);
        }
      }
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
        {result.title}
      </h3>

      {/* Authors */}
      <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
        <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{result.authors}</span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Calendar className="w-4 h-4" />
        <span>{new Date(result.publicationDate).toLocaleDateString()}</span>
      </div>

      {/* Abstract */}
      <p className="text-sm text-gray-700 mb-6 line-clamp-4 leading-relaxed">
        {result.abstract}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {imported ? (
          <div className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium text-center">
            ✓ Imported! Redirecting...
          </div>
        ) : (
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isImporting ? 'Importing...' : 'Import to Library'}
          </button>
        )}
        
        <a
          href={result.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View PDF
        </a>
      </div>

      {/* DOI */}
      {result.doi && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          DOI: {result.doi}
        </div>
      )}
    </div>
  );
}
