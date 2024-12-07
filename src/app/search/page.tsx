'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SearchBar } from '@/components/common/SearchBar';
import Image from 'next/image';
import { Spinner } from '@/components/common/Spinner';
import { SearchWrapper } from '@/components/search/SearchWrapper';
import { SearchResults } from '@/components/search/SearchResults';

interface Creator {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function SearchPage() {
  return (
    <SearchWrapper>
      {(searchParams) => {
        const query = searchParams.get('q') || '';
        return (
          <div className="container mx-auto px-4 py-8">
            <SearchResults initialQuery={query} />
          </div>
        );
      }}
    </SearchWrapper>
  );
}