import React from "react";

interface StatValueProps {
  value: string | number;
  className?: string;
}

const StatValue: React.FC<StatValueProps> = ({ value, className = "" }) => {
  return (
    <span className={`text-2xl font-bold text-text-main ${className}`}>
      {value}
    </span>
  );
};

export default StatValue;
