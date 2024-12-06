'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Spinner } from '@/components/common/Spinner';

export const UserMenu = () => {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return <Spinner className="w-8 h-8" />;
  }

  if (!user || !profile) {
    return (
      <div className="space-x-4">
        <Link href="/login" className="text-gray-700 hover:text-black">
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <span className="text-gray-700">{profile.name}</span>
      </button>

      <div className="absolute right-0 -mt-1 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible">
        <Link
          href="/dashboard"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <Link
          href="/settings"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Settings
        </Link>
        <button
          onClick={signOut}
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};