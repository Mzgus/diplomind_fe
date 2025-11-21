import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  const baseStyles =
    "bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75";

  // Fusionne les styles de base avec les classes personnalisées passées en props
  const combinedClassName = `${baseStyles} ${className || ""}`;

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;
