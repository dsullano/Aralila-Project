'use client';

import React, { useState, useEffect } from 'react';
import IntroAnimation from './IntroAnimation';
import { useAuth } from '@/contexts/AuthContext';

interface IntroOverlayProps {
  children: React.ReactNode;
}

export default function IntroOverlay({ children }: IntroOverlayProps) {
  const { user, updateProfile } = useAuth();
  const [showIntro, setShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed intro
    if (user && !user.has_completed_intro) {
      setShowIntro(true);
    }
    setIsLoading(false);
  }, [user]);

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
        const data = await response.json();
        // Update the user context
        if (updateProfile) {
          updateProfile(data);
        }
      }
    } catch (error) {
      console.error('Error completing intro:', error);
    }
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      {children}
    </>
  );
}
