'use client';

import { Feed } from '@/components/feed/Feed';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Welcome to FanFiles</h2>
        <p className="text-gray-600 mt-2">Discover and support your favorite creators</p>
      </div>
      <Feed subscribedContent={false} />
    </div>
  );
}
