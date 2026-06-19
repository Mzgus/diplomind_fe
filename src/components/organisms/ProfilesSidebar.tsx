import React, { useState, useEffect } from "react";
import StatusBadge from "../atoms/StatusBadge";
import Button from "../atoms/Buttons/Button";
import { PencilIcon, TrashIcon, PlusIcon, LinkIcon } from "@heroicons/react/24/outline";

interface ProfilesSidebarProps {
  selectedAccount: any | null;
  classesMap: Record<number, any[]>;
  coursesMap: Record<number, any[]>;
  onEditSheet: (sheet: any) => void;
  onDeleteSheet: (sheet: any) => void;
  onUnlinkSheet: (sheet: any) => void;
  onToggleSheetActive: (sheet: any) => void;
  onCreateSheet: () => void;
  onLinkSheet: () => void;
  onReorderSheets: (accountId: number, orderedSheetIds: number[]) => void;
}

const ProfilesSidebar: React.FC<ProfilesSidebarProps> = ({
  selectedAccount,
  classesMap,
  coursesMap,
  onEditSheet,
  onDeleteSheet,
  onUnlinkSheet,
  onToggleSheetActive,
  onCreateSheet,
  onLinkSheet,
  onReorderSheets
}) => {
  const [localSheets, setLocalSheets] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedAccount?.sheets) {
      setLocalSheets(selectedAccount.sheets);
    } else {
      setLocalSheets([]);
    }
  }, [selectedAccount?.sheets]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (_e: React.DragEvent, index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const reordered = [...localSheets];
      const draggedItem = reordered[draggedIndex];
      reordered.splice(draggedIndex, 1);
      reordered.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      setLocalSheets(reordered);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    if (selectedAccount) {
      onReorderSheets(selectedAccount.id, localSheets.map((s) => s.id));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface rounded-xl border border-border p-6 shadow-sm overflow-hidden">
      {selectedAccount ? (
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="border-b border-border pb-4 mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-text-main truncate">
              Profils Associés
            </h2>
            <p className="text-xs text-text-secondary truncate mt-1">
              Pour : <span className="font-semibold text-text-main">{selectedAccount.firstName} {selectedAccount.lastName}</span> ({selectedAccount.email})
            </p>
          </div>

          {/* Cards container with scroll */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-6">
            {localSheets.map((sheet: any, index: number) => {
              const profileClasses = classesMap[sheet.id] || [];
              const profileCourses = coursesMap[sheet.id] || [];
              const isDragging = draggedIndex === index;

              return (
                <div
                  key={sheet.id}
                  draggable={localSheets.length > 1}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e: React.DragEvent) => { e.preventDefault(); }}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-background/40 p-4 rounded-xl border border-border relative flex flex-col gap-3 hover:border-primary/50 transition-all select-none ${
                    isDragging ? "opacity-40 border-primary scale-[0.98]" : ""
                  }`}
                >
                  {/* Header card */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Grab Handle */}
                      {localSheets.length > 1 && (
                        <div className="text-text-muted cursor-move p-0.5 hover:text-text-main flex-shrink-0" title="Faites glisser pour réordonner">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a1 1 0 112 0v1a1 1 0 11-2 0V2zM7 6a1 1 0 112 0v1a1 1 0 11-2 0V6zM7 10a1 1 0 112 0v1a1 1 0 11-2 0v-1zM7 14a1 1 0 112 0v1a1 1 0 11-2 0v-1zM11 2a1 1 0 112 0v1a1 1 0 11-2 0V2zM11 6a1 1 0 112 0v1a1 1 0 11-2 0V6zM11 10a1 1 0 112 0v1a1 1 0 11-2 0v-1zM11 14a1 1 0 112 0v1a1 1 0 11-2 0v-1z" />
                          </svg>
                        </div>
                      )}
                      <div className="text-sm font-bold text-text-main truncate">
                        {sheet.first_name} {sheet.last_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onUnlinkSheet(sheet)}
                        className="p-1 text-text-secondary hover:text-orange-500 transition-colors focus:outline-none"
                        title="Dissocier ce profil de ce compte"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEditSheet(sheet)}
                        className="p-1 text-text-secondary hover:text-primary transition-colors focus:outline-none"
                        title="Modifier ce profil"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSheet(sheet)}
                        className="p-1 text-text-secondary hover:text-danger-text transition-colors focus:outline-none"
                        title="Supprimer ce profil"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge type="role" value={sheet.type_user} />
                  </div>

                  {/* Body card */}
                  <div className="space-y-1.5 text-xs text-text-muted mt-1">
                    <div className="flex items-center gap-2">
                      <span>Statut :</span>
                      <StatusBadge
                        type="status"
                        value={sheet.active}
                        onClick={() => onToggleSheetActive(sheet)}
                      />
                    </div>

                    {sheet.type_user === "student" && (
                      <div>
                        <span className="font-medium">Classe(s) : </span>
                        {profileClasses.length > 0 ? (
                          <span className="text-text-main font-semibold">
                            {profileClasses.map((c: any) => c.name).join(", ")}
                          </span>
                        ) : (
                          <span className="text-text-secondary italic">Aucune classe</span>
                        )}
                      </div>
                    )}

                    {sheet.type_user === "teacher" && (
                      <div>
                        <span className="font-medium">Cours : </span>
                        {profileCourses.length > 0 ? (
                          <span className="text-text-main font-semibold">
                            {profileCourses.map((c: any) => c.name).join(", ")}
                          </span>
                        ) : (
                          <span className="text-text-secondary italic">Aucun cours</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {localSheets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-text-secondary">
                <p className="text-sm italic">Aucun profil associé à ce compte.</p>
              </div>
            )}
          </div>

          {/* Dual Buttons Footer */}
          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border flex-shrink-0">
            <Button
              onClick={onCreateSheet}
              className="w-full bg-[#2D6A85] hover:bg-[#24566c] text-white py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              Créer un profil
            </Button>
            <Button
              onClick={onLinkSheet}
              className="w-full bg-secondary hover:bg-secondary-hover text-white py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-1.5 border border-border"
            >
              <LinkIcon className="w-4 h-4" />
              Associer un profil existant
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary py-12">
          <p className="text-sm">Sélectionnez un compte utilisateur pour voir ou gérer ses profils associés.</p>
        </div>
      )}
    </div>
  );
};

export default ProfilesSidebar;
