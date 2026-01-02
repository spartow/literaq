'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { 
  FileText, 
  Table2, 
  Database, 
  Sparkles,
  BookOpen,
  Download,
  Search,
  RefreshCw,
  Wand2
} from 'lucide-react';

type Tool = 
  | 'literature-review'
  | 'find-tables'
  | 'extract-data'
  | 'draft-writer'
  | 'paraphrase'
  | 'search';

export default function AssistantPage() {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const tools = [
    {
      id: 'literature-review' as Tool,
      name: 'Literature Review',
      description: 'Generate comprehensive literature reviews',
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      id: 'find-tables' as Tool,
      name: 'Find Tables',
      description: 'Extract tables from research papers',
      icon: Table2,
      color: 'bg-green-500',
    },
    {
      id: 'extract-data' as Tool,
      name: 'Extract Data',
      description: 'Pull structured data from papers',
      icon: Database,
      color: 'bg-purple-500',
    },
    {
      id: 'draft-writer' as Tool,
      name: 'Draft Writer',
      description: 'Write research sections with AI',
      icon: Wand2,
      color: 'bg-orange-500',
    },
    {
      id: 'paraphrase' as Tool,
      name: 'Paraphrase',
      description: 'Rewrite text in academic style',
      icon: RefreshCw,
      color: 'bg-pink-500',
    },
    {
      id: 'search' as Tool,
      name: 'Search Papers',
      description: 'Search millions of research papers',
      icon: Search,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Assistant Tools
            </h1>
            <p className="text-gray-600">
              Automate everyday research tasks with powerful AI tools
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">
        {!selectedTool ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              What do you want to work on?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (tool.id === 'search') {
                      router.push('/search');
                    } else {
                      setSelectedTool(tool.id);
                    }
                  }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
                >
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tool.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedTool(null)}
              className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to tools
            </button>

            {selectedTool === 'literature-review' && <LiteratureReviewTool />}
            {selectedTool === 'find-tables' && <FindTablesTool />}
            {selectedTool === 'extract-data' && <ExtractDataTool />}
            {selectedTool === 'draft-writer' && <DraftWriterTool />}
            {selectedTool === 'paraphrase' && <ParaphraseTool />}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function LiteratureReviewTool() {
  const [topic, setTopic] = useState('');
  const [papers, setPapers] = useState<string[]>([]);
  const [newPaper, setNewPaper] = useState('');
  const [review, setReview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const addPaper = () => {
    if (newPaper.trim()) {
      setPapers([...papers, newPaper.trim()]);
      setNewPaper('');
    }
  };

  const generateReview = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/assistant/literature-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, papers }),
      });

      if (res.ok) {
        const data = await res.json();
        setReview(data.review);
      }
    } catch (error) {
      console.error('Review generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Generate Literature Review
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Research Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Machine Learning in Healthcare"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Papers (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPaper}
                onChange={(e) => setNewPaper(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPaper()}
                placeholder="Paper title or DOI"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addPaper}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {papers.length > 0 && (
              <div className="mt-2 space-y-1">
                {papers.map((paper, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                    <span className="text-gray-700">{paper}</span>
                    <button
                      onClick={() => setPapers(papers.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={generateReview}
            disabled={!topic.trim() || isGenerating}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {isGenerating ? 'Generating Review...' : 'Generate Literature Review'}
          </button>
        </div>
      </div>

      {review && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Review</h3>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-900">{review}</div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(review)}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

function FindTablesTool() {
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [tables, setTables] = useState<any[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const fetchPapers = async () => {
    try {
      const res = await fetch('/api/papers');
      if (res.ok) {
        const data = await res.json();
        setPapers(data);
      }
    } catch (error) {
      console.error('Fetch papers error:', error);
    }
  };

  const extractTables = async () => {
    if (!selectedPaper) return;

    setIsExtracting(true);
    try {
      const res = await fetch('/api/assistant/extract-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: selectedPaper }),
      });

      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
      }
    } catch (error) {
      console.error('Table extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  useState(() => {
    fetchPapers();
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Extract Tables from Papers
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Paper
            </label>
            {papers.length === 0 ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  No papers in your library. Please upload a PDF first from the{' '}
                  <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">home page</a>
                  {' '}or{' '}
                  <a href="/library" className="text-indigo-600 hover:text-indigo-700 font-medium">library</a>.
                </p>
              </div>
            ) : (
              <select
                value={selectedPaper}
                onChange={(e) => setSelectedPaper(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a paper...</option>
                {papers.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.title || paper.originalFilename}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={extractTables}
            disabled={!selectedPaper || isExtracting}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Table2 className="w-5 h-5" />
            {isExtracting ? 'Extracting Tables...' : 'Find & Extract Tables'}
          </button>
        </div>
      </div>

      {tables.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Found {tables.length} Table{tables.length !== 1 ? 's' : ''}
          </h3>
          <div className="space-y-4">
            {tables.map((table, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Table {idx + 1}</h4>
                <div className="overflow-x-auto">
                  <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded">
                    {JSON.stringify(table, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExtractDataTool() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const extractData = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
          <h3 className="font-semibold text-gray-900 mb-3">Extracted Data</h3>
          <div className="space-y-2">
            {results.map((result, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                {JSON.stringify(result)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DraftWriterTool() {
  const [section, setSection] = useState('introduction');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDraft = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/assistant/draft-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, topic, context }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft);
      }
    } catch (error) {
      console.error('Draft generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          AI Draft Writer
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Type
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="introduction">Introduction</option>
              <option value="methodology">Methodology</option>
              <option value="results">Results</option>
              <option value="discussion">Discussion</option>
              <option value="conclusion">Conclusion</option>
              <option value="abstract">Abstract</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Deep Learning for Medical Diagnosis"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Context (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add any specific points or context to include..."
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={generateDraft}
            disabled={!topic.trim() || isGenerating}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            {isGenerating ? 'Generating Draft...' : 'Generate Draft'}
          </button>
        </div>
      </div>

      {draft && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Draft</h3>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-900">{draft}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ParaphraseTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paraphrase = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/writing/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, style: 'academic' }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutput(data.paraphrased);
      }
    } catch (error) {
      console.error('Paraphrase error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Original Text</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to paraphrase..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <button
          onClick={paraphrase}
          disabled={!input.trim() || isProcessing}
          className="mt-4 w-full px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium disabled:opacity-50"
        >
          {isProcessing ? 'Paraphrasing...' : 'Paraphrase'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Paraphrased Text</h3>
        <div className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto">
          {output ? (
            <p className="text-gray-900 whitespace-pre-wrap">{output}</p>
          ) : (
            <p className="text-gray-400">Paraphrased text will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
}
