import React from "react";
import Label from "../atoms/Label";

interface TextAreaGroupProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
    containerClassName?: string;
}

const TextAreaGroup: React.FC<TextAreaGroupProps> = ({
    label,
    id,
    containerClassName,
    className,
    ...textareaProps
}) => {
    return (
        <div className={`mb-4 ${containerClassName || ""}`}>
            <Label htmlFor={id} className="block text-white font-bold mb-2 text-sm">
                {label}
            </Label>
            <textarea
                id={id}
                {...textareaProps}
                className={`w-full rounded-2xl border-none px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4DA7C8] bg-white shadow-sm resize-none ${className || ""
                    }`}
                rows={4}
            />
        </div>
    );
};

export default TextAreaGroup;
