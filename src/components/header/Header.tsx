'use client';

import { UserMenu } from './UserMenu';
import { SearchBar } from '@/components/common/SearchBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const Header = () => {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          FanFiles
        </Link>

        {/* Search Bar */}
        <div className="max-w-md w-full mx-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
