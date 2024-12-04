import { UserMenu } from './UserMenu';
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            FanFiles
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
