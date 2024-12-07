'use client';

import { Suspense } from 'react';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { SearchResults } from '@/components/search/SearchResults';
import { Spinner } from '@/components/common/Spinner';

export default function SearchPage() {
  return (
    <Suspense fallback={<Spinner />}>
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
    </Suspense>
  );
}

