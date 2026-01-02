'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp, FileText, Lightbulb, FlaskConical } from 'lucide-react';

interface PaperSummary {
  tldr: string;
  keyFindings: string[];
  methodology: string;
  createdAt: string;
}

export function PaperSummaryCard({ paperId }: { paperId: string }) {
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/papers/${paperId}/summary`);
      
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        setError('Failed to generate summary');
      }
    } catch (err) {
      setError('Failed to load summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">AI Summary</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {!summary && !isLoading && (
            <div className="text-center py-6">
              <button
                onClick={fetchSummary}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Generate Summary
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">Generating AI summary...</p>
              <p className="text-xs text-gray-500 mt-1">This may take 10-20 seconds</p>
            </div>
          )}

          {error && (
            <div className="text-center py-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {summary && (
            <div className="space-y-4">
              {/* TL;DR */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">TL;DR</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {summary.tldr}
                </p>
              </div>

              {/* Key Findings */}
              {summary.keyFindings && summary.keyFindings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Key Findings</h4>
                  </div>
                  <ul className="space-y-2">
                    {summary.keyFindings.map((finding, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Methodology */}
              {summary.methodology && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Methodology</h4>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {summary.methodology}
                  </p>
                </div>
              )}

              {/* Generated Time */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                Generated {new Date(summary.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
