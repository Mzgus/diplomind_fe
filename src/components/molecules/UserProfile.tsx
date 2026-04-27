import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import Avatar from "../atoms/Avatar";
import StatusBadge from "../atoms/StatusBadge";
import {
  UserCircleIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../context/AuthContext";

import type { UserSheet } from "../../types";

interface UserProfileProps {
  userName: string;
  avatarUrl: string;
  profileType: string;
  availableProfiles: UserSheet[];
  onSwitchProfile: (id: number) => void;
}



const UserProfile: React.FC<UserProfileProps> = ({
  userName,
  avatarUrl,
  profileType,
  availableProfiles,
  onSwitchProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useContext(AuthContext);

  // Filter out the current profile from the list
  const filteredProfiles = (availableProfiles || []).filter(
    (p) => p.id !== user?.user_id
  );

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-4 focus:outline-none hover:opacity-80 transition-opacity"
      >
        <div className="hidden sm:flex items-center gap-2">
          <span className="font-medium text-text-main">{userName}</span>
          <StatusBadge type="role" value={profileType} />
        </div>
        <Avatar src={avatarUrl} alt={`Avatar de ${userName}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-surface rounded-xl shadow-xl z-50 border border-border overflow-hidden">
          <div className="py-1">
            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-text-main transition-colors duration-200 hover:bg-background/50"
            >
              <UserCircleIcon className="w-5 h-5 text-gray-500" />
              Mon Compte
            </Link>

            {filteredProfiles.length > 0 && (
              <>
                <div className="border-t border-border my-1"></div>
                <div className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Changer de profil
                </div>
                {filteredProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onSwitchProfile(profile.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-text-muted hover:bg-background/50 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-border">
                      <img 
                        src={profile.profile_picture || `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}`} 
                        alt={profile.last_name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                       <span className="font-medium text-text-main">{profile.first_name} {profile.last_name}</span>
                       <span className="text-xs text-text-secondary capitalize">{profile.type_user}</span>
                    </div>
                  </button>
                ))}
              </>
            )}

            <div className="border-t border-border my-1"></div>


            <Link
              to="/login"
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-sm text-danger-text capitalize transition-colors duration-300 transform hover:bg-background"
            >
              <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
              Déconnexion
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
