import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Avatar from "../atoms/Avatar";
import Badge from "../atoms/Badge";
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface UserProfileProps {
  userName: string;
  avatarUrl: string;
  profileType: string;
}

const getBadgeColor = (
  profileType: string
): "blue" | "green" | "yellow" | "red" => {
  switch (profileType.toLowerCase()) {
    case "admin":
      return "red";
    case "professeur":
      return "yellow";
    case "etudiant":
      return "green";
    default:
      return "blue";
  }
};

const UserProfile: React.FC<UserProfileProps> = ({
  userName,
  avatarUrl,
  profileType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-4 focus:outline-none"
      >
        <div className="hidden sm:flex items-center gap-2">
          <span className="font-medium text-text-main">{userName}</span>
          <Badge color={getBadgeColor(profileType)}>{profileType}</Badge>
        </div>
        <Avatar src={avatarUrl} alt={`Avatar de ${userName}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-xl z-20 border border-border">
          <Link
            to="/account"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-text-muted capitalize transition-colors duration-300 transform hover:bg-background"
          >
            <UserCircleIcon className="w-5 h-5" />
            Mon Compte
          </Link>
          <hr className="border-border" />
          <a
            href="/login"
            className="flex items-center gap-3 px-4 py-3 text-sm text-danger-text capitalize transition-colors duration-300 transform hover:bg-background"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Déconnexion
          </a>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
