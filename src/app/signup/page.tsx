'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { SearchWrapper } from '@/components/common/SearchWrapper';

interface SignupStatus {
  needsEmailConfirmation?: boolean;
  error?: string;
}

export default function SignupPage() {
  return (
    <SearchWrapper>
      <SignupContent />
    </SearchWrapper>
  );
}

function SignupContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupStatus, setSignupStatus] = useState<SignupStatus | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      setSignupStatus({
        needsEmailConfirmation: true
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (signupStatus?.needsEmailConfirmation) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center p-12">
          <div className="max-w-md">
            <h1 className="text-6xl font-bold text-white leading-tight mb-6">
              Check your email
            </h1>
            <p className="text-gray-400 text-xl">
              We've sent you a confirmation email. Please check your inbox and follow the instructions to complete your signup.
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4">Verification Required</h2>
            <p className="text-gray-600">
              Please check your email to complete the signup process.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
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

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8">Create Account</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-black hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
