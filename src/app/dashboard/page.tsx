'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { Suspense } from 'react';
import { Spinner } from '@/components/common/Spinner';

export default function DashboardPage() {
  return (
    <SearchWrapper>
      <Suspense fallback={<Spinner />}>
        <DashboardContent />
      </Suspense>
    </SearchWrapper>
  );
}

