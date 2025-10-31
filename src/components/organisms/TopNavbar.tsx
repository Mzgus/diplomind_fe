import React from "react";
import BrandLogo from "../molecules/BrandLogo";
import UserProfile from "../molecules/UserProfile";

interface TopBarProps {
  userName: string;
  avatarUrl: string;
  profileType: string;
}

const TopNavbar: React.FC<TopBarProps> = ({
  userName,
  avatarUrl,
  profileType,
}) => {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <BrandLogo />
          <UserProfile
            userName={userName}
            avatarUrl={avatarUrl}
            profileType={profileType}
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
