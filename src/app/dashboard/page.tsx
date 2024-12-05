'use client';

import { Feed } from '@/components/feed/Feed';

export default function DashboardPage() {
  return (
    <div>
      <Feed subscribedContent={true} />
    </div>
  );
}
