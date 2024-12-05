import { UserMenu } from './UserMenu';
import { Logo } from './Logo';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Logo />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
