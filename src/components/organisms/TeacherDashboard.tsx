import React from "react";
import DashboardCard from "../atoms/DashboardCard";
import StatWidget from "../molecules/StatWidget";
import { UsersIcon, AcademicCapIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface TeacherDashboardProps {
  classes: any[];
  pendingValidations: any[];
  stats: {
    totalStudents: number;
    activeClasses: number;
    pendingCount: number;
  };
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ classes: _classes, pendingValidations, stats }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatWidget 
          label="Élèves suivis" 
          value={stats.totalStudents} 
          icon={<UsersIcon className="w-6 h-6" />} 
        />
        <StatWidget 
          label="Classes actives" 
          value={stats.activeClasses} 
          icon={<AcademicCapIcon className="w-6 h-6" />} 
        />
        <StatWidget 
          label="Validations en attente" 
          value={stats.pendingCount} 
          icon={<ClipboardDocumentListIcon className="w-6 h-6" />} 
          className={stats.pendingCount > 0 ? "border-primary/50 bg-primary/5" : ""}
          onClick={() => navigate("/project-skills-validation")}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Pending Validations Queue */}
        <DashboardCard title="Dernières demandes de validation">
          {pendingValidations.length > 0 ? (
            <div className="space-y-3">
              {pendingValidations.map((v) => (
                <div key={`${v.user_id}-${v.skill_id}`} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-text-main">{v.user_name}</p>
                    <p className="text-xs text-text-muted">{v.skill_name}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/project-skills-validation?user_id=${v.user_id}&skill_id=${v.skill_id}`)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Noter
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4">Toutes les compétences sont notées !</p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};

export default TeacherDashboard;
