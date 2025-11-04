import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-[#4a6e78]">
      <input
        type="checkbox"
        className="
          form-checkbox h-5 w-5 
          rounded border-gray-300 
          text-[#277da1] 
          bg-gray-700 
          focus:ring-[#277da1] focus:ring-offset-0 focus:ring-2
        "
        {...props}
      />
      <span className="text-white font-medium">{label}</span>
    </label>
  );
};

export default Checkbox;
