'use client';

import { Suspense, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';

interface SearchWrapperProps {
  children: ReactNode | ((searchParams: URLSearchParams) => ReactNode);
}

function SearchContent({ children }: SearchWrapperProps) {
  const searchParams = useSearchParams();
  return typeof children === 'function' ? children(searchParams) : children;
}

export function SearchWrapper(props: SearchWrapperProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchContent {...props} />
    </Suspense>
  );
}

