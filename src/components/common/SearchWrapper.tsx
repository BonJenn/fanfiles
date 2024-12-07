'use client';

import { Suspense, ReactNode } from 'react';
import { Spinner } from '@/components/common/Spinner';

interface SearchWrapperProps {
  children: ReactNode;
}

export function SearchWrapper({ children }: SearchWrapperProps) {
  return (
    <Suspense fallback={<Spinner />}>
      {children}
    </Suspense>
  );
}


</```rewritten_file>