'use client';

import { Suspense, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';

interface SearchWrapperProps {
  children: ReactNode | ((searchParams: URLSearchParams) => ReactNode);
}

export function SearchWrapper({ children }: SearchWrapperProps) {
  const searchParams = useSearchParams();

  return (
    <Suspense fallback={<Spinner />}>
      {typeof children === 'function' ? children(searchParams) : children}
    </Suspense>
  );
}

