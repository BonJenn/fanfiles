'use client';

import { Suspense } from 'react';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { Spinner } from '@/components/common/Spinner';
import { SignupContent } from '@/components/auth/SignupContent';

export default function SignupPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchWrapper>
        <SignupContent />
      </SearchWrapper>
    </Suspense>
  );
}
