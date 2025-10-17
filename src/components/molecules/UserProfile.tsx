import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../atoms/Avatar';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

interface UserProfileProps {
  userName: string;
  avatarUrl: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName, avatarUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 focus:outline-none"
      >
        <span className="hidden sm:block font-medium text-gray-800">{userName}</span>
        <Avatar src={avatarUrl} alt={`Avatar de ${userName}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20">
          <Link
            to="/account"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform hover:bg-gray-100"
          >
            <UserCircleIcon className="w-5 h-5" />
            Mon Compte
          </Link>
          <hr className="border-gray-200" />
          <a href="/login" className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 capitalize transition-colors duration-300 transform hover:bg-gray-100">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Déconnexion
          </a>
        </div>
      )}
    </div>
  );
};

export default UserProfile;