'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <SearchWrapper>
      <DashboardContent />
    </SearchWrapper>
  );
}