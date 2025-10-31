import React from "react";
import {
  Squares2X2Icon,
  BookOpenIcon,
  RocketLaunchIcon,
  FlagIcon,
  UsersIcon,
  TrophyIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import SidebarNavItem from "../molecules/SidebarNavItem";

const navigationGroup1 = [
  { name: "Dashboard", href: "/", icon: Squares2X2Icon },
  { name: "Cours", href: "/courses", icon: BookOpenIcon },
  { name: "Projet", href: "/project", icon: RocketLaunchIcon },
  { name: "Étape", href: "/steps", icon: FlagIcon },
];

const navigationGroup2 = [
  { name: "Compétence", href: "/skills", icon: TrophyIcon },
  { name: "Classes", href: "/classes", icon: UsersIcon },
  { name: "Fiches utilisateur", href: "/user-sheets", icon: DocumentTextIcon },
  { name: "Utilisateurs", href: "/users", icon: UserIcon },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="flex h-full w-72 flex-col bg-[#374F5E] p-4">
      <nav className="flex flex-col gap-1">
        {/* Groupe 1 */}
        <ul className="flex flex-col gap-1">
          {navigationGroup1.map((item) => (
            <li key={item.name}>
              <SidebarNavItem
                to={item.href}
                icon={item.icon}
                label={item.name}
              />
            </li>
          ))}
        </ul>

        {/* Séparateur */}
        <div className="my-4" />

        {/* Groupe 2 */}
        <ul className="flex flex-col gap-1">
          {navigationGroup2.map((item) => (
            <li key={item.name}>
              <SidebarNavItem
                to={item.href}
                icon={item.icon}
                label={item.name}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
