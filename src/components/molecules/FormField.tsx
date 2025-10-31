import React from "react";
import Input from "../atoms/Input";
import Label from "../atoms/Label";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, id, ...inputProps }) => {
  return (
    <div className="mb-6">
      <Label htmlFor={id} className="block text-white font-medium mb-2">
        {label}
      </Label>
      <Input
        id={id}
        {...inputProps}
        className="w-full rounded-lg border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
    </div>
  );
};

export default FormField;
