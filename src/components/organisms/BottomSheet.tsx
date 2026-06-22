import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * A mobile-only bottom sheet / drawer component.
 * Slides up from the bottom of the screen with an overlay backdrop.
 * Only renders on screens below the `lg` breakpoint (controlled by parent).
 */
const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-[slideUp_300ms_ease-out]">
        {/* Drag handle + close */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-1 bg-border rounded-full" />
            {title && (
              <h3 className="text-base font-semibold text-text-main">{title}</h3>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BottomSheet;
