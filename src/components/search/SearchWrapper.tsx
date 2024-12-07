'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';

interface SearchWrapperProps {
  children: (searchParams: URLSearchParams) => React.ReactNode;
}

function SearchContent({ children }: SearchWrapperProps) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}

export function SearchWrapper({ children }: SearchWrapperProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchContent>{children}</SearchContent>
    </Suspense>
  );
}
