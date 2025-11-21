import React from "react";
import Label from "../atoms/Label";

interface SelectGroupProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    id: string;
    containerClassName?: string;
    children: React.ReactNode;
}

const SelectGroup: React.FC<SelectGroupProps> = ({
    label,
    id,
    containerClassName,
    className,
    children,
    ...selectProps
}) => {
    return (
        <div className={`mb-4 ${containerClassName || ""}`}>
            <Label htmlFor={id} className="block text-text-main font-bold mb-2 text-sm">
                {label}
            </Label>
            <div className="relative">
                <select
                    id={id}
                    {...selectProps}
                    className={`w-full appearance-none rounded-full border-none px-4 py-2 pr-8 text-text-main focus:outline-none focus:ring-2 focus:ring-primary bg-input shadow-sm ${className || ""
                        }`}
                >
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-main">
                    <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default SelectGroup;
