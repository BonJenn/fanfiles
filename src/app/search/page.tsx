'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SearchBar } from '@/components/common/SearchBar';
import Image from 'next/image';
import { Spinner } from '@/components/common/Spinner';

interface Creator {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      searchCreators(query);
    }
  }, [searchParams]);

  const searchCreators = async (query: string) => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      let supabaseQuery = supabase
        .from('profiles')
        .select('id, name, avatar_url, bio')
        .or(`name.ilike.%${query}%, email.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      // Exclude current user if logged in
      if (user) {
        supabaseQuery = supabaseQuery.neq('id', user.id);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Search results:', data);
      setCreators(data || []);
    } catch (err) {
      console.error('Error searching creators:', err);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    searchCreators(query);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold text-white leading-tight mb-6">
            Discover
            <br />
            Connect
            <br />
            Support
          </h1>
          <p className="text-gray-400 text-xl">
            Find and follow your favorite creators.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="w-full md:w-1/2 p-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Search Creators</h2>
          
          <SearchBar onSearch={handleSearch} />
          
          {loading ? (
            <div className="flex justify-center mt-8">
              <Spinner />
            </div>
          ) : creators.length > 0 ? (
            <div className="mt-8 space-y-4">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  onClick={() => router.push(`/creator/${creator.id}`)}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={creator.avatar_url || '/default-avatar.png'}
                      alt={creator.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{creator.name}</h3>
                    {creator.bio && (
                      <p className="text-sm text-gray-500 line-clamp-2">{creator.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchParams.get('q') ? (
            <div className="mt-8 text-center text-gray-500">
              No creators found matching your search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}