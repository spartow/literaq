'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add email to waitlist
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Literaq
          </h1>
        </div>

        {/* Main Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Something Amazing is Coming Soon
        </h2>
        
        <p className="text-xl text-gray-600 mb-12 max-w-xl mx-auto">
          We're building the future of AI-powered research assistance. 
          Get ready to transform how you work with academic papers.
        </p>

        {/* Email Signup */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                Notify Me
              </button>
            </div>
          </form>
        ) : (
          <div className="max-w-md mx-auto mb-12 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-green-800 font-semibold">
              ✓ Thanks! We'll notify you when we launch.
            </p>
          </div>
        )}

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Advanced AI to understand and analyze research papers
            </p>
          </div>

          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Smart Library</h3>
            <p className="text-sm text-gray-600">
              Organize and manage your research effortlessly
            </p>
          </div>

          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Chat Interface</h3>
            <p className="text-sm text-gray-600">
              Ask questions and get instant insights
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-gray-500 text-sm">
          <p>© 2026 Literaq. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
