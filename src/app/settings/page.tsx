'use client';

import { Suspense } from 'react';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { Spinner } from '@/components/common/Spinner';
import { SettingsContent } from '@/components/settings/SettingsContent';

export default function SettingsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchWrapper>
        <SettingsContent />
      </SearchWrapper>
    </Suspense>
  );
}
