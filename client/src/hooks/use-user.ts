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
          // Verify user exists in database, if not create them
          try {
            const response = await fetch('/.netlify/functions/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: existingUserId })
            });

            if (response.ok) {
              const userData = await response.json();
              // Update localStorage with confirmed user ID from database
              localStorage.setItem(USER_STORAGE_KEY, userData.userId);
              setUserId(userData.userId);
              console.log('User verified/created in database:', userData.userId);
            } else {
              // Use existing local ID if API fails
              setUserId(existingUserId);
            }
          } catch (error) {
            console.warn('API unavailable, using existing local user ID:', error);
            setUserId(existingUserId);
          }
          setIsLoading(false);
          return;
        }

        // No existing user - create new user in database
        try {
          const response = await fetch('/.netlify/functions/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Let database generate new user
          });

          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem(USER_STORAGE_KEY, userData.userId);
            setUserId(userData.userId);
            console.log('New user created in database:', userData.userId);
          } else {
            // API failed, generate local ID as fallback
            const fallbackUserId = generateUUID();
            localStorage.setItem(USER_STORAGE_KEY, fallbackUserId);
            setUserId(fallbackUserId);
            console.warn('API failed, using local fallback user ID:', fallbackUserId);
          }
        } catch (apiError) {
          // Network error or API unavailable, use generated ID
          const fallbackUserId = generateUUID();
          localStorage.setItem(USER_STORAGE_KEY, fallbackUserId);
          setUserId(fallbackUserId);
          console.warn('API unavailable, using local fallback user ID:', fallbackUserId, apiError);
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
