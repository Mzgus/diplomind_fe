import React from "react";
import type { Skill } from "../../types";
import type { SkillValidation } from "../../types";

const STATUS_LABEL: Record<string, string> = {
  validated: "Validé",
  rejected: "Non validé",
  partially_validated: "Partiellement validé",
  pending: "Non évalué",
};

const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
  validated:           { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  rejected:            { badge: "bg-red-500/15 text-red-400 border-red-500/30",             dot: "bg-red-400" },
  partially_validated: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",       dot: "bg-amber-400" },
  pending:             { badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",        dot: "bg-slate-500" },
};

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Skill | null;
  validation: SkillValidation | null;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, skill, validation }) => {
  if (!isOpen || !skill) return null;

  const status = validation?.status || "pending";
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = STATUS_LABEL[status] || status;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-main">{skill.name}</h3>
            {skill.description && (
              <p className="text-sm text-text-muted mt-1">{skill.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-text-muted hover:text-text-main transition-colors p-1"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {label}
          </span>
          {validation?.validated_at && (
            <span className="text-xs text-text-muted">
              {new Date(validation.validated_at).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>

        {/* Comment */}
        <div className="bg-background rounded-xl p-4 min-h-[80px]">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-2 font-medium">Commentaire</p>
          {validation?.comment ? (
            <p className="text-sm text-text-main leading-relaxed">{validation.comment}</p>
          ) : (
            <p className="text-sm text-text-muted italic">Aucun commentaire pour cette compétence.</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-secondary hover:bg-secondary-hover text-text-main rounded-lg text-sm font-medium transition-colors"
          type="button"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default CommentModal;
