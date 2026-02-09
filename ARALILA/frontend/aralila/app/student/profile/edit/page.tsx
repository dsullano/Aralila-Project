'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Loader2, User, School } from 'lucide-react';
import AnimatedBackground from '@/components/bg/animated-bg';
import Image from 'next/image';
import { env } from '@/lib/env';

const AVATARS = [
    { id: '1', src: '/images/bear.png', label: 'Bear' },
    { id: '2', src: '/images/cat.png', label: 'Cat' },
    { id: '3', src: '/images/chicken.png', label: 'Chicken' },
    { id: '4', src: '/images/owl.png', label: 'Owl' },
    { id: '5', src: '/images/panda.png', label: 'Panda' },
    { id: 'default', src: '/images/meerkat.png', label: 'Meerkat' },
];

export default function EditProfilePage() {
    const { user, updateProfile, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [customAvatar, setCustomAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setSchoolName(user.school_name || '');
            setSelectedAvatar(user.profile_pic || '/images/meerkat.png');
        }
    }, [user]);

    const handleAvatarSelect = (src: string) => {
        setSelectedAvatar(src);
        setCustomAvatar(null);
        setPreviewUrl(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCustomAvatar(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setSelectedAvatar(''); // Clear selected preset
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('Not authenticated');

            const formData = new FormData();
            
            // Always send name fields
            console.log('📝 Form data being sent:');
            console.log('  - first_name:', firstName);
            console.log('  - last_name:', lastName);
            console.log('  - school_name:', schoolName);
            
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('school_name', schoolName);

            // Avatar handling
            if (customAvatar) {
                console.log('📸 Uploading custom avatar:', customAvatar.name);
                formData.append('avatar_image', customAvatar);
            } else if (selectedAvatar) {
                console.log('🎨 Using preset avatar:', selectedAvatar);
                formData.append('profile_pic', selectedAvatar);
            }

            const url = `${env.backendUrl}/api/users/profile/update/`;
            console.log('📤 Sending PATCH request to:', url);
            console.log('🔑 Token:', token.substring(0, 20) + '...');
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            console.log('📨 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Server error:', response.status, errorText);
                throw new Error(`Failed to update profile (${response.status}): ${errorText}`);
            }

            const updatedUser = await response.json();
            console.log('✅ Profile updated successfully!');
            console.log('📊 Updated user data:', updatedUser);
            console.log('📷 first_name:', updatedUser.first_name);
            console.log('📷 last_name:', updatedUser.last_name);
            console.log('📷 full_name:', updatedUser.full_name);
            console.log('📷 profile_pic:', updatedUser.profile_pic);

            if (updateProfile) {
                console.log('🔄 Calling updateProfile to sync AuthContext');
                updateProfile(updatedUser);
            }

            setSuccess('Profile updated successfully!');

            setTimeout(() => {
                console.log('📍 Redirecting to profile page...');
                router.push('/student/profile');
            }, 1000);

        } catch (err: any) {
            console.error('❌ Error during submit:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!user) {
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden font-sans flex items-center justify-center">
            <div className="absolute inset-0 z-0">
                <AnimatedBackground />
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/student/profile')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-full text-white font-semibold transition-all duration-300 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Profile</span>
                    </button>

                    <h1 className="text-3xl font-bold text-white drop-shadow-md">Edit Profile</h1>
                    <div className="w-[140px]"></div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[calc(100vh-150px)] custom-scrollbar">

                    {error && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl flex items-center gap-2">
                            <span className="text-xl">✅</span> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10">

                        <div className="flex-1 flex flex-col items-center">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <User className="text-purple-400" /> Choose Avatar
                            </h2>

                            <div className="mb-6 w-full flex flex-col items-center">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-3 group cursor-pointer">
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Custom Preview" fill className="object-cover" />
                                    ) : customAvatar ? (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <span className="text-xs text-center p-2">{customAvatar.name}</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-slate-800/80 flex flex-col items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                            <span className="text-4xl">+</span>
                                            <span className="text-[10px]">Upload</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                {previewUrl && <p className="text-green-400 text-xs font-bold">Custom Avatar Selected</p>}
                            </div>

                            <div className="text-gray-400 text-sm mb-2">- OR -</div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                {AVATARS.map((avatar) => (
                                    <div
                                        key={avatar.id}
                                        onClick={() => handleAvatarSelect(avatar.src)}
                                        className={`relative cursor-pointer group rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedAvatar === avatar.src && !customAvatar
                                                ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105'
                                                : 'border-white/10 hover:border-white/30 hover:scale-105'
                                            }`}
                                    >
                                        <div className="aspect-square bg-slate-800 relative">
                                            <Image
                                                src={avatar.src}
                                                alt={avatar.label}
                                                fill
                                                className="object-cover"
                                            />
                                            {selectedAvatar === avatar.src && !customAvatar && (
                                                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                                    <div className="bg-purple-500 text-white p-1 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Select your character</p>
                        </div>

                        <div className="flex-1 flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <School className="text-cyan-400" /> Personal Info
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Enter your first name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Enter your last name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="schoolName" className="block text-sm font-medium text-gray-300 mb-1">
                                        School Name
                                    </label>
                                    <input
                                        type="text"
                                        id="schoolName"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Enter your school name"
                                    />
                                </div>
                            </div>

                            <div className="mt-auto pt-8">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${isSaving
                                            ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/20 active:scale-[0.98]'
                                        }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
        </div>
    );
}
