import React from "react";

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = "", action }) => {
  return (
    <div className={`bg-surface border border-border rounded-xl shadow-sm p-5 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-lg font-semibold text-text-main">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default DashboardCard;
