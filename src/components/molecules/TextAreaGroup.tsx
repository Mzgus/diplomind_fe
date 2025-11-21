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
            <Label htmlFor={id} className="block text-text-main font-bold mb-2 text-sm">
                {label}
            </Label>
            <textarea
                id={id}
                {...textareaProps}
                className={`w-full rounded-2xl border-none px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary bg-input shadow-sm resize-none ${className || ""
                    }`}
                rows={4}
            />
        </div>
    );
};

export default TextAreaGroup;
