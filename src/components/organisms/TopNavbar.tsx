import React from "react";
import BrandLogo from "../molecules/BrandLogo";
import UserProfile from "../molecules/UserProfile";
import ThemeToggle from "../atoms/ThemeToggle";

import type { UserSheet } from "../../types";

interface TopBarProps {
  userName: string;
  avatarUrl: string;
  profileType: string;
  availableProfiles: UserSheet[];
  onSwitchProfile: (id: number) => void;
}

const TopNavbar: React.FC<TopBarProps> = ({
  userName,
  avatarUrl,
  profileType,
  availableProfiles,
  onSwitchProfile,
}) => {
  return (
    <header className="w-full bg-topbar border-b border-border z-20 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <UserProfile
              userName={userName}
              avatarUrl={avatarUrl}
              profileType={profileType}
              availableProfiles={availableProfiles}
              onSwitchProfile={onSwitchProfile}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
