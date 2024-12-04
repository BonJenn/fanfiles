'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');
  const [signupStatus, setSignupStatus] = useState<{
    user: any;
    session: any;
    needsEmailConfirmation: boolean;
  } | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebug('Starting signup process...');

    try {
      // Check if user already exists first
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists. Please log in instead.');
      }

      // Add delay to prevent rapid requests
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        setDebug('Auth Error Details: ' + JSON.stringify(authError, null, 2));
        
        if (authError.status === 429) {
          // Store attempt timestamp in localStorage
          const timestamp = Date.now();
          localStorage.setItem('lastSignupAttempt', timestamp.toString());
          throw new Error('Please wait 60 seconds before trying again.');
        }
        throw authError;
      }

      // Set signup status for email confirmation message
      setSignupStatus({
        user: authData.user,
        session: authData.session,
        needsEmailConfirmation: !authData.session
      });

      if (!authData.session) {
        setDebug('Signup successful! Please check your email to confirm your account.');
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            avatar_url: null,
            bio: null,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) throw profileError;
        
        setDebug('Profile created successfully');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Detailed signup error:', error);
      setError(
        error.message || 
        'An unexpected error occurred. Please try again later.'
      );
      setDebug('Full error details: ' + JSON.stringify({
        message: error.message,
        name: error.name,
        code: error?.code,
        status: error?.status,
        details: error?.details,
        stack: error.stack
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create your FanFiles Account</h1>
      
      {signupStatus?.needsEmailConfirmation ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-green-600">Check your email!</h2>
          <p className="mt-2 text-gray-600">
            We've sent you a confirmation email. Please check your inbox and click the link to complete your registration.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}

          {debug && (
            <div className="mb-4 p-3 bg-gray-50 text-gray-600 rounded-md text-xs font-mono">
              {debug}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          <p className="mt-2 text-center text-sm text-gray-500">
            Already have an account? <Link className="font-medium text-indigo-600 hover:text-indigo-500" href="/login">Login</Link>
          </p>
        </>
      )}
    </div>
  );
}
