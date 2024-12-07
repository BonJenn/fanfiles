'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { SettingsContent } from '@/components/settings/SettingsContent';
import { Suspense } from 'react';
import { Spinner } from '@/components/common/Spinner';

export default function SettingsPage() {
  return (
    <SearchWrapper>
      <Suspense fallback={<Spinner />}>
        <SettingsContent />
      </Suspense>
    </SearchWrapper>
  );
}

