import React from "react";

interface BadgeProps {
  color: "blue" | "green" | "yellow" | "red";
  children: React.ReactNode;
}

const colorClasses = {
  blue: "bg-primary/20 text-primary",
  green: "bg-success-bg text-success-text",
  yellow: "bg-warning-bg text-warning-text",
  red: "bg-danger-bg text-danger-text",
};

const Badge: React.FC<BadgeProps> = ({ color, children }) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
