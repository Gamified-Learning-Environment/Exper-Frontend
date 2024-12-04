import { useState } from 'react';
import Link from 'next/link';

// User button props for user data and sign out function
interface UserButtonProps {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string; // Optional profile image URL
  };
  onSignOut: () => void;
}

export default function UserButton({ user, onSignOut }: UserButtonProps) { // UserButton component, takes user and onSignOut as props
  const [isOpen, setIsOpen] = useState(false); // State variable to keep track of dropdown menu open status

  return ( // Return user button
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-2 backdrop-blur-sm transition hover:bg-white/30"
      >
        <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-yellow-300">
          <img
            src={user.imageUrl || '/assets/images/default-avatar.png'}
            alt={user.username}
            className="h-full w-full object-cover"
          /> {/* Display user profile image or default avatar */}
        </div>
        <span className="hidden text-sm font-medium text-white md:block">
          {user.username}
        </span>
      </button>

      {isOpen && ( // Display dropdown menu if open
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-2 shadow-xl">
          <div className="space-y-1" role="menu">
            <Link
              href="/profile"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-purple-900 transition hover:bg-gradient-to-r hover:from-violet-500 hover:to-fuchsia-500 hover:text-white"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              🎮 Profile
            </Link>
            <button
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              className="block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-purple-900 transition hover:bg-gradient-to-r hover:from-violet-500 hover:to-fuchsia-500 hover:text-white"
              role="menuitem"
            >
              🚪 Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}