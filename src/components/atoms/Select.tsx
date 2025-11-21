import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ children, className, ...props }) => {
  const baseStyles =
    "w-full rounded-lg border-border px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary bg-input";
  const combinedClassName = `${baseStyles} ${className || ""}`;

  return (
    <select className={combinedClassName} {...props}>
      {children}
    </select>
  );
};

export default Select;
