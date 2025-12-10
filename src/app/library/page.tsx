'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CollectionsSidebar } from '@/components/collections-sidebar';
import { FileText, Calendar, User, Tag, Download, Trash2, FolderPlus } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  authors?: string | null;
  abstract?: string | null;
  createdAt: string;
  status: string;
  originalFilename?: string | null;
}

export default function LibraryPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await fetch('/api/papers');
      if (res.ok) {
        const data = await res.json();
        setPapers(data);
      }
    } catch (error) {
      console.error('Failed to fetch papers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPapers = papers.filter((paper) =>
    paper.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Collections Sidebar */}
      <CollectionsSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Library</h1>
            
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => router.push('/search')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Search arXiv
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">{papers.length}</span> papers
              </div>
              <div>
                <span className="font-medium text-gray-900">{filteredPapers.length}</span> results
              </div>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading papers...</p>
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No papers found' : 'No papers yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Upload a PDF or search arXiv to get started'}
                </p>
                {!searchQuery && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Upload PDF
                    </button>
                    <button
                      onClick={() => router.push('/search')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Search arXiv
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPapers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} onUpdate={fetchPapers} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaperCard({ paper, onUpdate }: { paper: Paper; onUpdate: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (paper.status === 'ready') {
      router.push(`/papers/${paper.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all ${
        paper.status === 'ready' ? 'cursor-pointer' : 'opacity-60'
      }`}
    >
      {/* Status Badge */}
      {paper.status !== 'ready' && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {paper.status === 'processing' ? 'Processing...' : 'Failed'}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {paper.title || 'Untitled'}
      </h3>

      {/* Authors */}
      {paper.authors && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{paper.authors}</span>
        </div>
      )}

      {/* Abstract */}
      {paper.abstract && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{paper.abstract}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(paper.createdAt).toLocaleDateString()}
        </div>

        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add to collection
            }}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Add to collection"
          >
            <FolderPlus className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Download citation
            }}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Export citation"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
