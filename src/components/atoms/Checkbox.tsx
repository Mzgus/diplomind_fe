import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
  return (
    <label
      className="group flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-primary/20
"
    >
      <input
        type="checkbox"
        className="
          form-checkbox h-5 w-5 
          rounded border-border 
          text-primary 
          bg-input 
          focus:ring-primary focus:ring-offset-0 focus:ring-2
        "
        {...props}
      />
      <span className="text-text-main font-medium group-hover:text-primary">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
