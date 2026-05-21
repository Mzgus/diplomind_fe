import React from "react";

interface AuditLogItemProps {
  action: string;
  user: string;
  time: string;
  icon?: React.ReactNode;
  className?: string;
}

const AuditLogItem: React.FC<AuditLogItemProps> = ({ action, user, time, icon, className = "" }) => {
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-border last:border-0 ${className}`}>
      {icon && (
        <div className="mt-1 text-text-muted">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-text-main">
          <span className="font-bold">{user}</span> {action}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{time}</p>
      </div>
    </div>
  );
};

export default AuditLogItem;
