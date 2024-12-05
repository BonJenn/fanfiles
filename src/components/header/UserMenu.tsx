'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
}

export const UserMenu = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      router.push('/login');
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);
        
        if (!user) {
          setProfile(null);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url, bio')
          .eq('id', user.id)
          .single();
        
        console.log('Profile data:', profile);
        console.log('Profile error:', error);
        
        if (error) {
          console.error('Profile fetch error:', error);
          setProfile(null);
          return;
        }
        
        setProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="flex items-center gap-4">
      {profile ? (
        <>
          <Link href="/dashboard" className="text-sm">
            {profile.name || 'Dashboard'}
          </Link>
          <Link href="/settings" className="text-sm">
            <div className="relative w-8 h-8">
              <Image
                src={profile.avatar_url || '/default-avatar.png'}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Force Sign Out
          </button>
          <Link href="/login" className="text-sm">
            Login
          </Link>
          <Link 
            href="/signup"
            className="bg-black text-white px-4 py-2 rounded-md text-sm"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
};