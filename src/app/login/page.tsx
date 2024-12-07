'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { LoginContent } from '@/components/auth/LoginContent';
import { Suspense } from 'react';
import { Spinner } from '@/components/common/Spinner';

export default function LoginPage() {
  return (
    <SearchWrapper>
      <Suspense fallback={<Spinner />}>
        <LoginContent />
      </Suspense>
    </SearchWrapper>
  );
}

