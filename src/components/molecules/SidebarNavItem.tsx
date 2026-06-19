import React from "react";
import { NavLink } from "react-router-dom";
import SidebarIcon from "../atoms/SidebarIcon";

interface SidebarNavItemProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
  isCollapsed?: boolean;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon, label, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      title={isCollapsed ? label : ""}
      className={({ isActive }) =>
        `flex items-center ${isCollapsed ? "justify-center px-0" : "gap-4 px-4"} py-3 text-white transition-all duration-300 hover:bg-sidebar-active/50 rounded-lg ${isActive ? "bg-sidebar-active" : "bg-transparent"
        }`
      }
    >
      <div className="flex-shrink-0">
        <SidebarIcon IconComponent={icon} />
      </div>
      {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-300">{label}</span>}
    </NavLink>
  );
};

export default SidebarNavItem;
