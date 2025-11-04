import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Checkbox from "../atoms/Checkbox";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  itemName: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
  itemName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelection);
  };

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#277da1]"
      >
        <span className="text-black">
          {selectedValues.length > 0
            ? `${selectedValues.length} ${itemName}${
                selectedValues.length > 1 ? "s" : ""
              } sélectionné(s)`
            : placeholder}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            {options.map((option) => (
              <Checkbox
                key={option.value}
                id={`dd-opt-${option.value}`}
                label={option.label}
                checked={selectedValues.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
