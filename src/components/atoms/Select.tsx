import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ children, className, ...props }) => {
  const baseStyles =
    "w-full rounded-lg border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const combinedClassName = `${baseStyles} ${className || ""}`;

  return (
    <select className={combinedClassName} {...props}>
      {children}
    </select>
  );
};

export default Select;
