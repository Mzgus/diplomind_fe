import React from "react";

interface SidebarIconProps {
  IconComponent: React.ComponentType<any>;
  className?: string;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({
  IconComponent,
  className,
}) => {
  return <IconComponent className={`w-6 h-6 shrink-0 ${className}`} />;
};

export default SidebarIcon;
