'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url, bio')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile:', checkError);
        return null;
      }

      if (!existingProfile) {
        console.log('No profile found, creating one...');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.user_metadata) {
          console.error('No user metadata found');
          return null;
        }

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email,
            name: user.user_metadata.name || user.email?.split('@')[0],
            avatar_url: user.user_metadata.avatar_url,
            bio: user.user_metadata.bio,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }

        console.log('Created new profile:', newProfile);
        return newProfile;
      }

      console.log('Found existing profile:', existingProfile);
      return existingProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const now = new Date().getTime();
          const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
          
          if (now >= expiresAt) {
            await signOut();
            return;
          }

          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          if (mounted && profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error in initAuth:', error);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        if (mounted && profileData) {
          setProfile(profileData);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      setUser(null);
      setProfile(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};