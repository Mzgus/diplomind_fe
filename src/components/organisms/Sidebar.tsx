import React, { useContext } from "react";
import {
  Squares2X2Icon,
  BookOpenIcon,
  UsersIcon,
  UserIcon,
  AcademicCapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import SidebarNavItem from "../molecules/SidebarNavItem";
import { AuthContext } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";

interface NavItem {
  name: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ForwardRefExoticComponent<any>;
  roles?: string[]; // undefined = visible to all authenticated users
}

const navigationGroup1: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Squares2X2Icon },
  { name: "Curriculum", href: "/curriculum", icon: BookOpenIcon },
];

const navigationGroup2: NavItem[] = [
  {
    name: "Classes",
    href: "/classes",
    icon: AcademicCapIcon,
    roles: ["admin", "teacher"],
  },
  {
    name: "Utilisateurs",
    href: "/users",
    icon: UsersIcon,
    roles: ["admin"],
  },
  {
    name: "Mon profil",
    href: "/account",
    icon: UserIcon,
  },
];

const Sidebar: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { isCollapsed, toggleCollapsed, isOpen, setIsOpen } = useSidebar();
  const role: string = user?.user_role ?? "";

  const isVisible = (item: NavItem) =>
    !item.roles || item.roles.includes(role);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar p-4 transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
          w-72
        `}
      >
        <nav className="flex flex-col gap-1 overflow-x-hidden flex-1">
          {/* Groupe 1 */}
          <ul className="flex flex-col gap-1">
            {navigationGroup1.filter(isVisible).map((item) => (
              <li key={item.name} onClick={() => setIsOpen(false)}>
                <SidebarNavItem
                  to={item.href}
                  icon={item.icon}
                  label={item.name}
                  isCollapsed={isCollapsed}
                />
              </li>
            ))}
          </ul>

          {/* Séparateur */}
          <div className="my-4 border-t border-white/10" />

          {/* Groupe 2 */}
          <ul className="flex flex-col gap-1">
            {navigationGroup2.filter(isVisible).map((item) => (
              <li key={item.name} onClick={() => setIsOpen(false)}>
                <SidebarNavItem
                  to={item.href}
                  icon={item.icon}
                  label={item.name}
                  isCollapsed={isCollapsed}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle Button (Desktop only) */}
        <div className="hidden lg:flex mt-auto pt-4 border-t border-white/10 items-center justify-center">
          <button
            onClick={toggleCollapsed}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors`}
            title={isCollapsed ? "Développer" : "Réduire"}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-6 w-6" />
            ) : (
              <ChevronLeftIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
