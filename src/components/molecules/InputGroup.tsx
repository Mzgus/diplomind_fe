import React from "react";
import Input from "../atoms/Input";
import Label from "../atoms/Label";

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    containerClassName?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
    label,
    id,
    containerClassName,
    className,
    ...inputProps
}) => {
    return (
        <div className={`mb-4 ${containerClassName || ""}`}>
            <Label htmlFor={id} className="block text-white font-bold mb-2 text-sm">
                {label}
            </Label>
            <Input
                id={id}
                {...inputProps}
                className={`w-full rounded-full border-none px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4DA7C8] bg-white shadow-sm ${className || ""
                    }`}
            />
        </div>
    );
};

export default InputGroup;
