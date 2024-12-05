'use client';

import Link from 'next/link';

export const Logo = () => {
  return (
    <Link href="/feed" className="font-bold text-xl">
      FanFiles
    </Link>
  );
};
