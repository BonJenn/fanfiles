'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Profile {
  name: string;
}

export const UserMenu = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);
        
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
          
          console.log('Profile data:', data);
          
          if (error) throw error;
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return null;

  return profile ? (
    <div className="flex items-center space-x-4">
      <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
        {profile.name}
      </Link>
      <button
        onClick={handleSignOut}
        className="text-gray-600 hover:text-gray-800"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <div className="flex items-center space-x-4">
      <Link href="/login" className="text-gray-600 hover:text-gray-800">
        Login
      </Link>
      <Link
        href="/signup"
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
      >
        Sign Up
      </Link>
    </div>
  );
};
