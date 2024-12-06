'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ApiError } from '@/types/error';
import Link from 'next/link';

interface SignupStatus {
  needsEmailConfirmation?: boolean;
  error?: string;
}

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupStatus, setSignupStatus] = useState<SignupStatus | null>(null);

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
    setSignupStatus(null);

    try {
      // Validate email format
      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password length
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            avatar_url: null,
            bio: null,
            email: formData.email
          }
        }
      });
      
      if (error) throw error;

      // Manually create profile if trigger fails
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: formData.email,
            name: formData.name,
            avatar_url: null,
            bio: null,
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }
      
      setSignupStatus({ needsEmailConfirmation: true });
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Failed to sign up');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8">Create your Account</h2>
          
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

              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 text-lg"
                >
                  {loading ? 'Loading...' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-black hover:underline font-medium">
                  Login here
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
