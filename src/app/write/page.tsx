'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Wand2, 
  RefreshCw, 
  Shield, 
  Copy, 
  Check,
  Sparkles 
} from 'lucide-react';

export default function WritePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'paraphrase' | 'aidetector' | 'writer'>('paraphrase');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">AI Writing Tools</h1>
            <button
              onClick={() => router.push('/library')}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              ← Back to Library
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('paraphrase')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'paraphrase'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Paraphraser
              </div>
            </button>
            <button
              onClick={() => setActiveTab('aidetector')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'aidetector'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                AI Detector
              </div>
            </button>
            <button
              onClick={() => setActiveTab('writer')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'writer'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                AI Writer
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'paraphrase' && <ParaphraserTool />}
        {activeTab === 'aidetector' && <AIDetectorTool />}
        {activeTab === 'writer' && <AIWriterTool />}
      </div>
    </div>
  );
}

function ParaphraserTool() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [style, setStyle] = useState<'academic' | 'simple'>('academic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setOutputText(''); // Clear previous output
    
    try {
      const res = await fetch('/api/writing/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, style }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutputText(data.paraphrased || 'No paraphrased text returned');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setOutputText(`Error: ${errorData.error || 'Failed to paraphrase text. Please try again.'}`);
      }
    } catch (error) {
      console.error('Paraphrase error:', error);
      setOutputText('Error: Unable to connect to paraphrase service. Please check your connection and try again.');
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Original Text</h3>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as 'academic' | 'simple')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="academic">Academic Style</option>
            <option value="simple">Simple Style</option>
          </select>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to paraphrase..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {inputText.length} characters
          </div>
          <button
            onClick={handleParaphrase}
            disabled={!inputText.trim() || isProcessing}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Paraphrasing...' : 'Paraphrase'}
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Paraphrased Text</h3>
          {outputText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
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
          <div className="mt-4 text-sm text-gray-500">
            {outputText.length} characters
          </div>
        )}
      </div>
    </div>
  );
}

function AIDetectorTool() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ aiProbability: number; isAI: boolean } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDetect = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setResult(null); // Clear previous result
    
    try {
      const res = await fetch('/api/writing/ai-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Failed to detect AI content. Please try again.'}`);
      }
    } catch (error) {
      console.error('AI detection error:', error);
      alert('Error: Unable to connect to AI detection service. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Analyze Text</h3>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste text to check if it's AI-generated..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {inputText.length} characters
          </div>
          <button
            onClick={handleDetect}
            disabled={!inputText.trim() || isAnalyzing}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Detect AI'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center mb-4">
              <div className={`text-6xl font-bold mb-2 ${result.isAI ? 'text-red-600' : 'text-green-600'}`}>
                {Math.round(result.aiProbability)}%
              </div>
              <p className="text-lg font-medium text-gray-900">
                {result.isAI ? 'Likely AI-Generated' : 'Likely Human-Written'}
              </p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all ${result.isAI ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${result.aiProbability}%` }}
              />
            </div>

            <p className="mt-4 text-sm text-gray-600 text-center">
              {result.isAI
                ? 'This text shows characteristics of AI-generated content.'
                : 'This text appears to be human-written.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AIWriterTool() {
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/writing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, instructions }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.text);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Topic & Instructions</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Machine Learning Applications in Healthcare"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions (optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide specific instructions for the AI writer..."
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
      </div>

      {generatedText && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Generated Content</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-900">{generatedText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
