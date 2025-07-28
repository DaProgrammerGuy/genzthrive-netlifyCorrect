import { useState, useEffect } from 'react';

const USER_STORAGE_KEY = 'roadmap_user_id';

// Simple UUID v4 generator for maximum compatibility
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if user already exists in localStorage
        const existingUserId = localStorage.getItem(USER_STORAGE_KEY);
        
        if (existingUserId) {
          setUserId(existingUserId);
          setIsLoading(false);
          return;
        }

        // Generate new user ID
        const newUserId = generateUUID();
        
        // Try to create user in database
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: newUserId })
          });

          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem(USER_STORAGE_KEY, userData.userId);
            setUserId(userData.userId);
          } else {
            // API failed, use generated ID
            localStorage.setItem(USER_STORAGE_KEY, newUserId);
            setUserId(newUserId);
          }
        } catch (apiError) {
          // Network error or API unavailable, use generated ID
          console.warn('API unavailable, using local user ID:', apiError);
          localStorage.setItem(USER_STORAGE_KEY, newUserId);
          setUserId(newUserId);
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
        // Final fallback
        const fallbackUserId = generateUUID();
        localStorage.setItem(USER_STORAGE_KEY, fallbackUserId);
        setUserId(fallbackUserId);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  return { userId, isLoading };
}