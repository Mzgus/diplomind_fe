import React from "react";
import BrandLogo from "../molecules/BrandLogo";
import UserProfile from "./UserProfile";
import ThemeToggle from "../atoms/ThemeToggle";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSidebar } from "../../context/SidebarContext";

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
  const { isOpen, toggleOpen } = useSidebar();

  return (
    <header className="w-full bg-topbar border-b border-border z-50 relative">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-text-main hover:bg-background lg:hidden transition-colors"
              onClick={toggleOpen}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <BrandLogo />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
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
