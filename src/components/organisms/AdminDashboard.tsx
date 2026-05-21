import React from "react";
import DashboardCard from "../atoms/DashboardCard";
import StatWidget from "../molecules/StatWidget";
import AuditLogItem from "../molecules/AuditLogItem";
import { 
  UsersIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  CpuChipIcon, 
  CommandLineIcon,
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";

interface AdminDashboardProps {
  auditLog: any[];
  systemStatus: {
    dbStatus: "online" | "offline" | "slow";
    apiLatency: number;
    uptime: string;
  };
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalProjects: number;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ auditLog, systemStatus, stats }) => {
  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatWidget 
          label="Utilisateurs" 
          value={stats.totalUsers} 
          icon={<UsersIcon className="w-6 h-6" />} 
        />
        <StatWidget 
          label="Cours" 
          value={stats.totalCourses} 
          icon={<AcademicCapIcon className="w-6 h-6" />} 
        />
        <StatWidget 
          label="Projets" 
          value={stats.totalProjects} 
          icon={<BriefcaseIcon className="w-6 h-6" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <DashboardCard title="État du Système">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-hover rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CpuChipIcon className="w-5 h-5 text-text-muted" />
                <span className="text-sm font-medium text-text-muted">Base de données</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  systemStatus.dbStatus === "online" ? "bg-green-500" : 
                  systemStatus.dbStatus === "slow" ? "bg-yellow-500" : "bg-red-500"
                }`}></div>
                <span className="text-lg font-bold text-text-main capitalize">
                  {systemStatus.dbStatus === "online" ? "Opérationnelle" : 
                   systemStatus.dbStatus === "slow" ? "Ralentie" : "Indisponible"}
                </span>
              </div>
            </div>

            <div className="p-4 bg-surface-hover rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CommandLineIcon className="w-5 h-5 text-text-muted" />
                <span className="text-sm font-medium text-text-muted">Latence API</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-text-main">{systemStatus.apiLatency}</span>
                <span className="text-xs text-text-muted font-medium">ms</span>
              </div>
            </div>

            <div className="p-4 bg-surface-hover rounded-lg border border-border col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-text-muted" />
                <span className="text-sm font-medium text-text-muted">Uptime du service</span>
              </div>
              <span className="text-lg font-bold text-text-main">{systemStatus.uptime}</span>
            </div>
          </div>
        </DashboardCard>

        {/* Audit Log */}
        <DashboardCard title="Journal d'audit rapide">
          {auditLog.length > 0 ? (
            <div className="space-y-1">
              {auditLog.map((log, index) => (
                <AuditLogItem 
                  key={index}
                  user={log.user}
                  action={log.action}
                  time={log.time}
                  icon={log.type === "security" ? <ShieldCheckIcon className="w-4 h-4 text-red-400" /> : undefined}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4">Aucune activité récente.</p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
