'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';

interface SearchWrapperProps {
  children: React.ReactNode | ((searchParams: URLSearchParams) => React.ReactNode);
}

function SearchContent({ children }: SearchWrapperProps) {
  const searchParams = useSearchParams();
  if (typeof children === 'function') {
    return children(searchParams);
  }
  return children;
}

export function SearchWrapper({ children }: SearchWrapperProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchContent>{children}</SearchContent>
    </Suspense>
  );
}

</```rewritten_file>