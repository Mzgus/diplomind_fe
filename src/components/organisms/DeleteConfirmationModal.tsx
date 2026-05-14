import React from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
  title?: string;
  message?: string;
  confirmText?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  title,
  message,
  confirmText,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow-lg text-text-main border border-border">
        <h3 className="text-xl font-bold text-center mb-4">
          {title || "Confirmation de suppression"}
        </h3>
        <p className="text-center mb-8">
          {message || `Êtes-vous sûr de vouloir supprimer ${itemType} "${itemName}" ?`}
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
            className="bg-danger-bg hover:bg-danger-border text-white w-1/2"
          >
            {confirmText || "Confirmer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
