import React from "react";
import { NavLink } from "react-router-dom";
import SidebarIcon from "../atoms/SidebarIcon";

interface SidebarNavItemProps {
  to: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ForwardRefExoticComponent<any>;
  label: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 text-white transition-colors hover:bg-[#4A90A4]/50 rounded-lg ${
          isActive ? "bg-[#4A90A4]" : "bg-transparent"
        }`
      }
    >
      <SidebarIcon IconComponent={icon} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export default SidebarNavItem;
