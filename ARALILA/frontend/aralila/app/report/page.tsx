'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reportService } from '@/lib/services/reportService';
import { useAuth } from '@/contexts/AuthContext';
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animated-bg";

export default function ReportPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [screenshot, setScreenshot] = useState<File | undefined>();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            await reportService.createReport({ title, description, screenshot });
            setSuccess('Report submitted successfully!');
            setTitle('');
            setDescription('');
            setScreenshot(undefined);
            // Reset file input manually
            const fileInput = document.getElementById('screenshot') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

    if (!user) {
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
            <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />
            <Sidebar />

            <main className="relative z-10 flex flex-col items-center justify-center min-h-full p-4 pt-28 pb-10 md:p-8 md:pl-24 md:pt-32 md:pb-12">
                <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6 sm:p-8 shadow-xl">
                    <h1 className="text-3xl font-bold text-white mb-6 text-center">Report an Issue</h1>

                    {error && (
                        <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                placeholder="Brief summary of the issue"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={5}
                                className="mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                placeholder="Detailed description of the issue..."
                            />
                        </div>

                        <div>
                            <label htmlFor="screenshot" className="block text-sm font-medium text-gray-300">
                                Screenshot (Optional)
                            </label>
                            <input
                                type="file"
                                id="screenshot"
                                accept="image/*"
                                onChange={(e) => setScreenshot(e.target.files?.[0])}
                                className="mt-1 block w-full text-sm text-gray-300
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-purple-600 file:text-white
                                  hover:file:bg-purple-700
                                  cursor-pointer"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
