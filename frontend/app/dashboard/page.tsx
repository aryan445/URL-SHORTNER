'use client';

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useRouter } from 'next/navigation';

interface Url {
    id: string;
    shortUrlKey: string;
    originalUrl: string;
    clicks: number;
    createdAt: string;
}

export default function Dashboard() {
    const [urls, setUrls] = useState<Url[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const [viewQr, setViewQr] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrls = async () => {
            try {
                const response = await api.get('/url');
                // response.data could be { data: [], total: 0 } or just [] depending on backend.
                // Based on controller: return this.urlService.findMyLinks(req.user.id, l, o);
                // service returns { data: [], total: number }
                setUrls(response.data.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    router.push('/login');
                } else {
                    setError('Failed to load links');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUrls();
    }, [router]);

    const getFullShortUrl = (shortKey: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}/${shortKey}`; // Redirect endpoint is usually at root /:shortKey or /api/url/:shortKey? 
        // Controller: @Get(':shortKey') in UrlController which has @Controller('url') prefix.
        // So it is /api/url/:shortKey
        // Wait, the redirect endpoint is:
        // @Controller('url') -> @Get(':shortKey')
        // So it is /api/url/my-geek
        // The previous feedback said: "tell me one thing this Qr will not worrk on another servers so i think in response tthere should be some public url"
        // The user likely wants the short URL to indeed be the accessible one.
        // Ideally it should be at root /:shortKey but the nest app has prefix /api and controller 'url'.
        // So distinct path: http://localhost:3000/api/url/:shortKey
        return `${baseUrl}/api/url/${shortKey}`;
    };

    const getQrUrl = (shortKey: string) => {
        // Return the backend endpoint for QR image
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        return `${baseUrl}/url/${shortKey}/qr`;
    };

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-600">{error}</div>;
    }

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Links</h1>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {urls.length === 0 ? (
                            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No links found. Create one!</li>
                        ) : (
                            urls.map((url) => (
                                <li key={url.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-sm font-medium text-indigo-600 truncate">{getFullShortUrl(url.shortUrlKey)}</p>
                                                <p className="mt-1 flex items-center text-sm text-gray-500">
                                                    <span className="truncate">{url.originalUrl}</span>
                                                </p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                                                <div className="text-sm text-gray-500">
                                                    Clicks: <span className="font-bold text-gray-900">{url.clicks}</span>
                                                </div>
                                                <button
                                                    onClick={() => setViewQr(viewQr === url.shortUrlKey ? null : url.shortUrlKey)}
                                                    className="text-xs text-indigo-500 hover:text-indigo-700 underline"
                                                >
                                                    {viewQr === url.shortUrlKey ? 'Hide QR' : 'Show QR'}
                                                </button>
                                            </div>
                                        </div>
                                        {viewQr === url.shortUrlKey && (
                                            <div className="mt-4 flex justify-center bg-gray-50 p-4 rounded-lg">
                                                <img
                                                    src={getQrUrl(url.shortUrlKey)}
                                                    alt={`QR code for ${url.shortUrlKey}`}
                                                    className="h-48 w-48 object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
