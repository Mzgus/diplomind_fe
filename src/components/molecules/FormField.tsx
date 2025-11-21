import React from "react";

// Types pour les props d'un input et d'un textarea
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

interface FormFieldProps extends Omit<InputProps & TextareaProps, "id"> {
  label: string;
  id: string;
  as?: "input" | "textarea";
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  as = "input",
  ...props
}) => {
  const commonClasses =
    "mt-1 block w-full px-3 py-2 bg-input border border-border rounded-md text-text-main shadow-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm";

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-text-main">
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          className={commonClasses}
          {...(props as TextareaProps)}
        />
      ) : (
        <input id={id} className={commonClasses} {...(props as InputProps)} />
      )}
    </div>
  );
};

export default FormField;
