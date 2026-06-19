import React from "react";
import DashboardCard from "../atoms/DashboardCard";
import ProjectBrief from "../molecules/ProjectBrief";
import StatWidget from "../molecules/StatWidget";
import { AcademicCapIcon, BriefcaseIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface StudentDashboardProps {
  projects: any[];
  validatedSteps: any[];
  stats: {
    validatedSkills: number;
    pendingValidations: number;
    activeProjects: number;
  };
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ projects, validatedSteps, stats }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatWidget 
          label="Compétences validées" 
          value={stats.validatedSkills} 
          icon={<CheckBadgeIcon className="w-6 h-6" />} 
        />
        <StatWidget 
          label="En attente" 
          value={stats.pendingValidations} 
          icon={<AcademicCapIcon className="w-6 h-6" />} 
        />
        <StatWidget 
          label="Projets actifs" 
          value={stats.activeProjects} 
          icon={<BriefcaseIcon className="w-6 h-6" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <DashboardCard title="Projets en cours">
          {projects.length > 0 ? (
            <div className="space-y-1">
              {projects.map((p) => (
                <ProjectBrief 
                  key={p.id} 
                  name={p.name} 
                  progress={p.progress || 0} 
                  status={p.status} 
                  onClick={() => navigate(`/project`)}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4">Aucun projet en cours.</p>
          )}
        </DashboardCard>

        {/* Validated Steps */}
        <DashboardCard title="Dernières étapes validées">
          {validatedSteps.length > 0 ? (
            <div className="space-y-4">
              {validatedSteps.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => navigate(`/project`)}
                  className="flex flex-col gap-1 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-bg-secondary/50 transition-colors group px-2 -mx-2 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text-main group-hover:text-primary transition-colors">{s.name}</span>
                    <span className="text-xs font-bold text-green-500 px-2 py-0.5 bg-green-500/10 rounded-full">
                      Validée
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">Projet: {s.projectName}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4">Aucune étape validée pour le moment.</p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};

export default StudentDashboard;
