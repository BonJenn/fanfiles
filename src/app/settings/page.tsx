'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Spinner } from '@/components/common/Spinner';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function SettingsPage() {
  return (
    <SearchWrapper>
      <SettingsContent />
    </SearchWrapper>
  );
}

function SettingsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: null as File | null
  });
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update formData when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        avatar: null
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let avatar_url = profile?.avatar_url;

      // Handle avatar upload if new file is selected
      if (formData.avatar) {
        const fileExt = formData.avatar.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData.avatar);

        if (uploadError) throw uploadError;
        avatar_url = data.path;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Spinner />
      </div>
    );
  }
  if (!profile) return <div>Please log in</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-6">
              {formData.avatar && (
                <div className="relative w-20 h-20">
                  <Image
                    src={URL.createObjectURL(formData.avatar)}
                    alt="Profile Preview"
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  avatar: e.target.files?.[0] || null
                }))}
                className="text-sm"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: e.target.value
              }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bio: e.target.value
              }))}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Save Changes
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
          <button
            onClick={handleSignOut}
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
