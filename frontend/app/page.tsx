'use client';

import { useState } from 'react';
import api from '../utils/api';
import Link from 'next/link';

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setLoading(true);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Please login to shorten URLs.');
      setLoading(false);
      return;
    }

    try {
      const payload: any = { originalUrl };
      if (customKey && customKey.trim()) {
        payload.shortKey = customKey.trim();
      }

      const response = await api.post('/url', payload);
      // Construct full short URL for display
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
      setShortUrl(`${baseUrl}/${response.data.shortKey}`);
    } catch (err: any) {
      console.error('Shorten URL Error:', err);
      if (err.response?.status === 401) {
        setError('Please login to shorten URLs.');
      } else if (!err.response) {
        setError('Network Error: Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Shorten Your Links
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Paste your long URL below to create a shorter, more manageable link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="url"
              required
              className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="https://example.com/very-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
            <input
              type="text"
              className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm border-t-0"
              placeholder="Custom alias (optional)"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {shortUrl && (
          <div className="rounded-md bg-green-50 p-4 mt-6">
            <div className="text-sm text-green-700 mb-2">Success! Here is your short URL:</div>
            <div className="flex items-center justify-center space-x-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500 font-medium text-lg break-all"
              >
                {shortUrl}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shortUrl)}
                className="text-gray-500 hover:text-gray-700"
                title="Copy to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
