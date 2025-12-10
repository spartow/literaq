'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Loader2, AlertCircle, ArrowLeft, Download, MoreVertical } from 'lucide-react';
import PDFViewer from '@/components/PDFViewer';
import ChatPanel from '@/components/ChatPanel';
import { PaperSummaryCard } from '@/components/paper-summary';

interface Paper {
  id: string;
  title: string | null;
  originalFilename: string;
  fileUrl: string | null;
  status: string;
  createdAt: string;
}

export default function PaperPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.paperId as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`/api/papers/${paperId}`);
        
        if (!response.ok) {
          throw new Error('Paper not found');
        }

        const data = await response.json();
        setPaper(data);

        // Poll if still processing
        if (data.status === 'processing') {
          setTimeout(fetchPaper, 3000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load paper');
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-600">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <p className="text-gray-900 font-semibold">
            {error || 'Paper not found'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (paper.status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">
            Processing your paper...
          </h2>
          <p className="text-gray-600">
            We're extracting the text, generating embeddings, and preparing
            everything for you to chat with. This usually takes 1-2 minutes.
          </p>
        </div>
      </div>
    );
  }

  if (paper.status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">
            Processing failed
          </h2>
          <p className="text-gray-600">
            We couldn't process this paper. Please try uploading again.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button
                onClick={() => router.push('/library')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {paper.title || paper.originalFilename}
                </h1>
                <p className="text-sm text-gray-500 truncate">
                  {paper.originalFilename}
                </p>
              </div>
            </div>
            <div className="relative ml-4">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <a
                    href={`/api/papers/${paperId}/export?format=bibtex`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    onClick={() => setShowExportMenu(false)}
                  >
                    BibTeX
                  </a>
                  <a
                    href={`/api/papers/${paperId}/export?format=ris`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowExportMenu(false)}
                  >
                    RIS
                  </a>
                  <a
                    href={`/api/papers/${paperId}/export?format=apa`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowExportMenu(false)}
                  >
                    APA
                  </a>
                  <a
                    href={`/api/papers/${paperId}/export?format=mla`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowExportMenu(false)}
                  >
                    MLA
                  </a>
                  <a
                    href={`/api/papers/${paperId}/export?format=chicago`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                    onClick={() => setShowExportMenu(false)}
                  >
                    Chicago
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer - Left Side */}
        <div className="flex-1 border-r border-gray-200">
          {paper.fileUrl ? (
            <PDFViewer fileUrl={paper.fileUrl} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center space-y-2">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-gray-600">PDF preview not available</p>
                <p className="text-sm text-gray-500">
                  You can still chat with the paper content
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Summary + Chat */}
        <div className="w-96 lg:w-[28rem] flex flex-col bg-gray-50">
          <div className="p-4 space-y-4 overflow-y-auto">
            <PaperSummaryCard paperId={paper.id} />
          </div>
          <div className="flex-1 border-t border-gray-200">
            <ChatPanel paperId={paper.id} paperTitle={paper.title || paper.originalFilename} />
          </div>
        </div>
      </div>
    </div>
  );
}
