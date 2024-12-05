'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, email, avatar_url, bio')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Profile fetch error:', error);
            setProfile(null);
            return;
          }
          
          setProfile(data);
        } else {
          setProfile(null);
        }
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
      if (session) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative">
      {loading ? (
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      ) : profile ? (
        <div className="flex items-center space-x-2">
          <Link href="/settings">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={profile.avatar_url || '/default-avatar.png'}
                alt={profile.name}
                fill
                className="object-cover"
              />
            </div>
          </Link>
          <span className="text-sm font-medium">{profile.name}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-gray-600">
            Login
          </Link>
          <Link 
            href="/signup" 
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};