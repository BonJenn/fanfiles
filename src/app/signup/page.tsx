'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { SignupContent } from '@/components/auth/SignupContent';
import { Suspense } from 'react';
import { Spinner } from '@/components/common/Spinner';

export default function SignupPage() {
  return (
    <SearchWrapper>
      <Suspense fallback={<Spinner />}>
        <SignupContent />
      </Suspense>
    </SearchWrapper>
  );
}

</```
rewritten_file>