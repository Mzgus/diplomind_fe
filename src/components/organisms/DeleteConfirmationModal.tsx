import React from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md rounded-xl bg-[#2D525B] p-8 shadow-lg text-white">
        <h3 className="text-xl font-bold text-center mb-4">
          Confirmation de suppression
        </h3>
        <p className="text-center mb-8">
          Êtes-vous sûr de vouloir supprimer {itemType} "{itemName}" ?
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 w-1/2"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 w-1/2"
          >
            Confirmer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
