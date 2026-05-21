import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}

const ButtonEdit = ({ className, title="Éditer", ...props }: ButtonProps) => {
  const baseStyles =
    "cursor-pointer p-2 text-text-muted hover:text-text-main hover:bg-background rounded-full transition-colors";

  // Fusionne les styles de base avec les classes personnalisées passées en props
  const combinedClassName = `${baseStyles} ${className || ""}`;

  return (
    <button className={combinedClassName} title={title} type="button" {...props}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    </button>
  );
};

export default ButtonEdit;
