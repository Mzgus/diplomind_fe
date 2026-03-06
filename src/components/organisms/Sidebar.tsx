import React, { useContext } from "react";
import {
  Squares2X2Icon,
  BookOpenIcon,
  RocketLaunchIcon,
  FlagIcon,
  UsersIcon,
  TrophyIcon,
  DocumentTextIcon,
  UserIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import SidebarNavItem from "../molecules/SidebarNavItem";
import { AuthContext } from "../../context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ForwardRefExoticComponent<any>;
  roles?: string[]; // undefined = visible to all authenticated users
}

const navigationGroup1: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Squares2X2Icon },
  { name: "Cours", href: "/courses", icon: BookOpenIcon },
  { name: "Projet", href: "/project", icon: RocketLaunchIcon },
  { name: "Étape", href: "/steps", icon: FlagIcon },
  { name: "Compétence", href: "/skills", icon: TrophyIcon },
];

const navigationGroup2: NavItem[] = [
  {
    name: "Classes",
    href: "/classes",
    icon: AcademicCapIcon,
    roles: ["admin", "teacher"],
  },
  {
    name: "Fiches utilisateur",
    href: "/user-sheets",
    icon: DocumentTextIcon,
    roles: ["admin"],
  },
  {
    name: "Utilisateurs",
    href: "/users",
    icon: UserIcon,
    roles: ["admin"],
  },
  {
    name: "Mon profil",
    href: "/account",
    icon: UsersIcon,
  },
];

const Sidebar: React.FC = () => {
  const { user } = useContext(AuthContext);
  const role: string = user?.user_role ?? "";

  const isVisible = (item: NavItem) =>
    !item.roles || item.roles.includes(role);

  return (
    <aside className="flex h-full w-72 flex-col bg-sidebar p-4">
      <nav className="flex flex-col gap-1">
        {/* Groupe 1 */}
        <ul className="flex flex-col gap-1">
          {navigationGroup1.filter(isVisible).map((item) => (
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

        {/* Validation compétences — admin/teacher only */}
        <ul className="flex flex-col gap-1">
          {isVisible({ name: "Validation", href: "/project-skills-validation", icon: AcademicCapIcon, roles: ["admin", "teacher"] }) && (
            <li>
              <SidebarNavItem
                to="/project-skills-validation"
                icon={AcademicCapIcon}
                label="Validation compétences"
              />
            </li>
          )}
        </ul>

        {/* Séparateur */}
        <div className="my-4" />

        {/* Groupe 2 */}
        <ul className="flex flex-col gap-1">
          {navigationGroup2.filter(isVisible).map((item) => (
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

