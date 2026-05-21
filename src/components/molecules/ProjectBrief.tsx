import React from "react";
import ProgressBar from "../atoms/ProgressBar";

interface ProjectBriefProps {
  name: string;
  progress: number;
  status?: string;
  className?: string;
  onClick?: () => void;
}

const ProjectBrief: React.FC<ProjectBriefProps> = ({ name, progress, status, className = "", onClick }) => {
  return (
    <div 
      className={`py-3 first:pt-0 last:pb-0 border-b border-border last:border-0 group cursor-pointer hover:bg-bg-secondary/30 transition-colors px-2 -mx-2 rounded-lg ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-text-main group-hover:text-primary transition-colors">{name}</h4>
        {status && (
          <span className="text-xs px-2 py-1 bg-surface-hover rounded-md text-text-muted">
            {status}
          </span>
        )}
      </div>
      <ProgressBar progress={progress} />
    </div>
  );
};

export default ProjectBrief;
