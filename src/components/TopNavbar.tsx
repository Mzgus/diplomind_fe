import React from 'react';

interface TopBarProps {
  userName: string;
  avatarUrl: string;
  logoUrl?: string;
}

const SkillCraftIcon = () => (
  <svg
    className="w-8 h-8 text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);


const TopNavbar: React.FC<TopBarProps> = ({ userName, avatarUrl }) => {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <SkillCraftIcon />
            <span className="text-2xl font-bold text-blue-600">
              SKILLCRAFT
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block font-medium text-gray-800">
              {userName}
            </span>
            <img
              src={avatarUrl}
              alt={`Avatar de ${userName}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
          
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;