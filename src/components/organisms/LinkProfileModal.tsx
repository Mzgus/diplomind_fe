import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import StatusBadge from "../atoms/StatusBadge";

interface UnlinkedSheet {
  id: number;
  last_name: string;
  first_name: string;
  type_user: string;
}

interface LinkProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (sheetId: number) => void;
  unlinkedSheets: UnlinkedSheet[];
}

const LinkProfileModal: React.FC<LinkProfileModalProps> = ({
  isOpen,
  onClose,
  onLink,
  unlinkedSheets
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedSheetId(null);
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredSheets = unlinkedSheets.filter(sheet =>
    `${sheet.first_name} ${sheet.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.type_user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSheetId !== null) {
      onLink(selectedSheetId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold">Associer un profil existant</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main focus:outline-none"
            type="button"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <p className="text-xs text-text-secondary">
            Sélectionnez une fiche utilisateur déjà créée dans l'application pour la rattacher à ce compte.
          </p>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Rechercher par nom ou rôle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary"
          />

          {/* List of unlinked sheets */}
          <div className="border border-border rounded-lg bg-background overflow-hidden h-[220px] flex flex-col">
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {filteredSheets.length === 0 ? (
                <div className="p-4 text-text-muted italic text-xs text-center">
                  Aucun profil orphelin disponible.
                </div>
              ) : (
                filteredSheets.map((sheet) => {
                  const isSelected = selectedSheetId === sheet.id;
                  return (
                    <label
                      key={sheet.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/5" : "hover:bg-background/80"
                      }`}
                    >
                      <input
                        type="radio"
                        name="unlinked-sheet"
                        checked={isSelected}
                        onChange={() => setSelectedSheetId(sheet.id)}
                        className="h-4 w-4 text-primary border-border focus:ring-primary"
                      />
                      <div className="flex-1 flex justify-between items-center min-w-0">
                        <span className={`text-sm truncate ${isSelected ? "text-primary font-semibold" : "text-text-main"}`}>
                          {sheet.first_name} {sheet.last_name}
                        </span>
                        <StatusBadge type="role" value={sheet.type_user} className="ml-2 flex-shrink-0" />
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              className="bg-secondary hover:bg-secondary-hover px-5 py-2 text-white font-medium"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={selectedSheetId === null}
              className={`bg-primary hover:bg-primary-hover px-5 py-2 text-white font-medium ${
                selectedSheetId === null ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Associer
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default LinkProfileModal;
