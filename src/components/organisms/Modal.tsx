import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-gray-900/50 z-40 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="relative z-50"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant sur la modale
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
