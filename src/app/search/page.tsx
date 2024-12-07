'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { SearchResults } from '@/components/search/SearchResults';

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