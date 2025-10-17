import React from 'react';

interface SidebarIconProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  IconComponent: React.ForwardRefExoticComponent<any>;
  className?: string;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ IconComponent, className }) => {
  return (
    <IconComponent className={`w-6 h-6 shrink-0 ${className}`} />
  );
};

export default SidebarIcon;