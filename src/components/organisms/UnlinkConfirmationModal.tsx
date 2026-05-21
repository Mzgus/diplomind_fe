import React from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";

interface UnlinkConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  profileName: string;
  accountEmail: string;
}

const UnlinkConfirmationModal: React.FC<UnlinkConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  profileName,
  accountEmail
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow-lg text-text-main border border-border">
        <h3 className="text-xl font-bold text-center mb-4">
          Dissocier le profil
        </h3>
        <p className="text-center text-sm mb-6 text-text-secondary">
          Êtes-vous sûr de vouloir dissocier le profil <span className="font-semibold text-text-main">"{profileName}"</span> du compte <span className="font-semibold text-text-main">"{accountEmail}"</span> ?
        </p>
        <p className="text-center text-xs text-text-muted mb-8 italic">
          Le profil ne sera pas supprimé et pourra être associé à nouveau plus tard.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={onClose}
            className="bg-secondary hover:bg-secondary-hover text-white w-1/2"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-primary hover:bg-primary-hover text-white w-1/2"
          >
            Confirmer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UnlinkConfirmationModal;
