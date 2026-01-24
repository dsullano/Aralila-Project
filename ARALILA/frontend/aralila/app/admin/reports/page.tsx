'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportService, Report } from '@/lib/services/reportService';
import { useAuth } from '@/contexts/AuthContext';
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animated-bg";

export default function AdminReportsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [error, setError] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            if (!user.is_staff) {
                router.push('/');
                return;
            }
            fetchReports();
        } else if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchReports = async () => {
        setIsLoadingReports(true);
        try {
            const data = await reportService.getReports();
            setReports(data);
        } catch (err) {
            setError('Failed to load reports');
            console.error(err);
        } finally {
            setIsLoadingReports(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await reportService.updateReportStatus(id, newStatus);
            // Optimistically update the UI or refetch
            setReports(reports.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        }
    };

    if (authLoading || (isLoadingReports && !reports.length)) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

    if (!user || !user.is_staff) return null;

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
            <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />
            <Sidebar />

            <main className="relative z-10 flex flex-col items-center min-h-full p-4 pt-28 pb-10 md:p-8 md:pl-24 md:pt-32 md:pb-12">
                <div className="w-full max-w-7xl bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/10">
                        <h1 className="text-3xl font-bold text-white">Manage Reports</h1>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 text-red-200 px-6 py-3 border-b border-red-500/50">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Screenshot
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 bg-transparent">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            #{report.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            {report.user_email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            <div className="font-medium text-white mb-1">{report.title}</div>
                                            <div className="text-gray-400 truncate max-w-xs text-xs" title={report.description}>
                                                {report.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {report.screenshot ? (
                                                <a href={report.screenshot} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                                                    View Image
                                                </a>
                                            ) : (
                                                <span className="text-gray-600">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${report.status === 'RESOLVED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                                    report.status === 'DISMISSED' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                                        'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-8 py-1 text-base border-gray-500 bg-black/50 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="RESOLVED">Resolved</option>
                                                <option value="DISMISSED">Dismissed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
