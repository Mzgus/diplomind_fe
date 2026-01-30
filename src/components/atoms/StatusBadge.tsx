import React from "react";

interface StatusBadgeProps {
  type: "role" | "status";
  value: any; // Can be string, boolean
  onClick?: () => void;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, onClick, className = "" }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  let label = String(value);

  if (type === "role") {
    const role = String(value).toLowerCase();
    switch (role) {
      case "admin":
        colorClass = "bg-purple-100 text-purple-800";
        label = "Admin";
        break;
      case "teacher":
        colorClass = "bg-amber-100 text-amber-800";
        label = "Professeur";
        break;
      case "student":
        colorClass = "bg-blue-100 text-blue-800";
        label = "Élève";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800";
        label = String(value);
    }
  } else if (type === "status") {
    if (value === true || value === "active") {
      colorClass = "bg-green-100 text-green-800";
      label = "Actif";
    } else {
      colorClass = "bg-red-100 text-red-800";
      label = "Inactif";
    }
  }

  return (
    <span
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${className} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
