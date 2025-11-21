import React from "react";
import BrandLogo from "../molecules/BrandLogo";
import UserProfile from "../molecules/UserProfile";
import ThemeToggle from "../atoms/ThemeToggle";

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
    <header className="w-full bg-surface border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserProfile
              userName={userName}
              avatarUrl={avatarUrl}
              profileType={profileType}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
