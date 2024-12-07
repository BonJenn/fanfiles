'use client';

import { Suspense, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';

interface SearchWrapperProps {
  children: ReactNode;
}

function SearchContent({ children }: SearchWrapperProps) {
  useSearchParams();
  return children;
}

export function SearchWrapper({ children }: SearchWrapperProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchContent>{children}</SearchContent>
    </Suspense>
  );
}
</```
rewritten_file>