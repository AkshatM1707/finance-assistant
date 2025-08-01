'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          router.push(`/${userData.userId}/user-dashboard`);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user, redirecting to login:', error);
        router.push('/login');
      }
    };

    fetchUserAndRedirect();
  }, [router]);

  return null; // Or a loading spinner
}