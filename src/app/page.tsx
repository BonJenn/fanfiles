'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex">
      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold text-white leading-tight mb-6">
            Create More.
            <br />
            Earn More.
            <br />
            Share More.
          </h1>
          <p className="text-gray-400 text-xl">
            A platform where creators can share exclusive content with their biggest supporters.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8">Get Started</h2>
          <div className="space-y-4">
            <Link 
              href="/signup"
              className="block w-full bg-black text-white text-center py-3 px-4 rounded-md hover:bg-gray-800 text-lg"
            >
              Create Account
            </Link>
            <Link 
              href="/login"
              className="block w-full border border-black text-black text-center py-3 px-4 rounded-md hover:bg-gray-50 text-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
