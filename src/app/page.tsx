'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  return (
    <SearchWrapper>
      <HomeContent />
    </SearchWrapper>
  );
}

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to FanFiles</h1>
        <p className="text-gray-600 mb-8">Share and discover exclusive content</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-block bg-white text-black px-6 py-3 rounded-md border border-black hover:bg-gray-100"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}