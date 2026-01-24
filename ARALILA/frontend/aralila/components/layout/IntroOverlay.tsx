'use client';

import React, { useState, useEffect } from 'react';
import IntroAnimation from './IntroAnimation';
import { useAuth } from '@/contexts/AuthContext';

interface IntroOverlayProps {
  children: React.ReactNode;
}

export default function IntroOverlay({ children }: IntroOverlayProps) {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const [showIntro, setShowIntro] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Only show intro for authenticated users who haven't completed it yet
    const token = localStorage.getItem('access_token');

    if (token && user) {
      if (!user.has_completed_intro) {
        setShowIntro(true);
      } else {
        setShowIntro(false);
      }
    } else {
      setShowIntro(false);
    }

    setIsChecking(false);
  }, [user, authLoading]);

  const handleIntroComplete = async () => {
    setShowIntro(false);

    // Call API to mark intro as completed
    try {
      const response = await fetch('/api/users/intro/complete/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        // Optimistically update context to prevent flash
        if (updateProfile) {
          updateProfile({ ...user, has_completed_intro: true });
        }
      }
    } catch (error) {
      console.error('Error completing intro:', error);
    }
  };

  if (authLoading || isChecking) {
    return <>{children}</>;
  }

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      {children}
    </>
  );
}
