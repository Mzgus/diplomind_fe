import React from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

interface MobileBackButtonProps {
  onClick: () => void;
  label?: string;
}

/**
 * A "← Retour" button displayed only on mobile (hidden on lg+).
 * Used in split-pane pages to navigate back from the detail panel to the list.
 */
const MobileBackButton: React.FC<MobileBackButtonProps> = ({ onClick, label = "Retour" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors py-2 px-1 -ml-1 mb-2"
    >
      <ChevronLeftIcon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};

export default MobileBackButton;
