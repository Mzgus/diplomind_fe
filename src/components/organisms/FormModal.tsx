import React from "react";
import Modal from "./Modal";
import Button from "../atoms/Button";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  title: string;
  children: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-[#2D525B] p-8 shadow-lg">
        <h3 className="text-xl font-bold text-white text-center mb-6">
          {title}
        </h3>
        <form onSubmit={onSave}>
          <div className="space-y-4">{children}</div>
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default FormModal;
