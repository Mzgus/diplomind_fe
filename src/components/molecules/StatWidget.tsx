import React from "react";
import StatValue from "../atoms/StatValue";

interface StatWidgetProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const StatWidget: React.FC<StatWidgetProps> = ({ label, value, icon, trend, className = "", onClick }) => {
  return (
    <div 
      className={`bg-surface border border-border rounded-xl p-5 flex items-center gap-4 transition-all ${onClick ? "cursor-pointer hover:border-primary/50 hover:shadow-md" : ""} ${className}`}
      onClick={onClick}
    >
      {icon && (
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-text-muted mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <StatValue value={value} />
          {trend && (
            <span className={`text-xs font-bold ${trend.isUp ? "text-green-500" : "text-red-500"}`}>
              {trend.isUp ? "↑" : "↓"} {trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatWidget;
