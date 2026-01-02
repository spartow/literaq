'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { Copy, Check, Search } from 'lucide-react';

type CitationFormat = 'APA' | 'MLA' | 'Chicago' | 'Harvard';
type SourceType = 'Journal Article' | 'Book' | 'Website' | 'Conference Paper';

export default function CitationsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [format, setFormat] = useState<CitationFormat>('APA');
  const [sourceType, setSourceType] = useState<SourceType>('Journal Article');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }
  
  // Form fields
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [journal, setJournal] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');
  
  const [citation, setCitation] = useState('');

  const generateCitation = () => {
    if (!authors || !year || !title) {
      alert('Please fill in at least Authors, Year, and Title');
      return;
    }

    let generatedCitation = '';

    if (format === 'APA') {
      // APA format: Author, A. A. (Year). Title of article. Journal Name, volume(issue), pages. https://doi.org/xxx
      generatedCitation = `${authors} (${year}). ${title}. `;
      if (journal) generatedCitation += `${journal}`;
      if (volume) generatedCitation += `, ${volume}`;
      if (issue) generatedCitation += `(${issue})`;
      if (pages) generatedCitation += `, ${pages}`;
      generatedCitation += '.';
      if (doi) generatedCitation += ` https://doi.org/${doi}`;
      else if (url) generatedCitation += ` ${url}`;
    } else if (format === 'MLA') {
      // MLA format: Author. "Title." Journal, vol. X, no. Y, Year, pp. Z-Z.
      generatedCitation = `${authors}. "${title}." `;
      if (journal) generatedCitation += `${journal}`;
      if (volume) generatedCitation += `, vol. ${volume}`;
      if (issue) generatedCitation += `, no. ${issue}`;
      generatedCitation += `, ${year}`;
      if (pages) generatedCitation += `, pp. ${pages}`;
      generatedCitation += '.';
    } else if (format === 'Chicago') {
      // Chicago format: Author. "Title." Journal volume, no. issue (Year): pages.
      generatedCitation = `${authors}. "${title}." `;
      if (journal) generatedCitation += `${journal} `;
      if (volume) generatedCitation += `${volume}`;
      if (issue) generatedCitation += `, no. ${issue}`;
      generatedCitation += ` (${year})`;
      if (pages) generatedCitation += `: ${pages}`;
      generatedCitation += '.';
    } else {
      // Harvard format
      generatedCitation = `${authors} ${year}, '${title}'`;
      if (journal) generatedCitation += `, ${journal}`;
      if (volume) generatedCitation += `, vol. ${volume}`;
      if (issue) generatedCitation += `, no. ${issue}`;
      if (pages) generatedCitation += `, pp. ${pages}`;
      generatedCitation += '.';
    }

    setCitation(generatedCitation);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Simple parsing - try to extract basic info
      alert('Paste feature coming soon! For now, please enter citation details manually.');
    } catch (err) {
      alert('Unable to read clipboard. Please enter citation details manually.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />

      <div className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Free {format} Citation Generator</h1>
            <p className="text-gray-600">Generate accurate citations in multiple formats</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Format and Source Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Citation Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as CitationFormat)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="APA">APA - American Psychological Association</option>
                  <option value="MLA">MLA - Modern Language Association</option>
                  <option value="Chicago">Chicago - Chicago Manual of Style</option>
                  <option value="Harvard">Harvard - Harvard Referencing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as SourceType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Journal Article">Journal Article</option>
                  <option value="Book">Book</option>
                  <option value="Website">Website</option>
                  <option value="Conference Paper">Conference Paper</option>
                </select>
              </div>
            </div>

            {/* Input Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Citation Information</h3>
                <button
                  onClick={handlePaste}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Paste text to auto-fill
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authors <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    placeholder="e.g., Smith, J., & Johnson, A."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g., 2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Journal/Publication
                    </label>
                    <input
                      type="text"
                      value={journal}
                      onChange={(e) => setJournal(e.target.value)}
                      placeholder="e.g., Nature"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Machine learning in healthcare"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume
                    </label>
                    <input
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="e.g., 45"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue
                    </label>
                    <input
                      type="text"
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pages
                    </label>
                    <input
                      type="text"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="e.g., 123-145"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DOI
                    </label>
                    <input
                      type="text"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      placeholder="e.g., 10.1234/example"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="e.g., https://example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={generateCitation}
                className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Generate Citation
              </button>
            </div>

            {/* Generated Citation */}
            {citation && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Citation</h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 leading-relaxed">{citation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
