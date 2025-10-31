import React from "react";

interface BadgeProps {
  color: "blue" | "green" | "yellow" | "red";
  children: React.ReactNode;
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
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
