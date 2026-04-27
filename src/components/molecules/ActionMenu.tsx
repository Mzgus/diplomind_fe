import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface ActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = dropdownRef.current?.offsetWidth || 160; // 160 is the w-40 width
      setPosition({
        // Positionne le menu 4px en dessous du bouton
        top: rect.bottom + window.scrollY + 4,
        // Centre le menu par rapport au bouton
        left: rect.left + window.scrollX + rect.width / 2 - dropdownWidth / 2,
      });
    }
  };

  useEffect(() => {
    const closeMenu = () => setIsOpen(false);

    if (isOpen) {
      calculatePosition();
      window.addEventListener("resize", closeMenu, true);
      window.addEventListener("scroll", closeMenu, true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", closeMenu, true);
      window.removeEventListener("scroll", closeMenu, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    setIsOpen(false);
    action?.();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer p-2 rounded-full hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <EllipsisVerticalIcon className="w-5 h-5 text-text-muted" />
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            className="absolute w-40 bg-surface rounded-md shadow-lg z-50 border border-border"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <a
              href="#"
              onClick={(e) => handleActionClick(e, onEdit)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-main hover:bg-background"
            >
              <PencilIcon className="w-4 h-4" />
              Modifier
            </a>
            <a
              href="#"
              onClick={(e) => handleActionClick(e, onDelete)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-danger-text hover:bg-background"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </a>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ActionMenu;
