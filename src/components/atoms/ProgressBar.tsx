import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, className = "" }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-text-muted">{label}</span>
          <span className="text-sm font-medium text-text-muted">{clampedProgress}%</span>
        </div>
      )}
      <div className="w-full bg-border rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
