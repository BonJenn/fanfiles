'use client';

import { Suspense } from 'react';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { Spinner } from '@/components/common/Spinner';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchWrapper>
        <DashboardContent />
      </SearchWrapper>
    </Suspense>
  );
}
