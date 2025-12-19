import React from "react";

interface SelectGroupProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    disabled?: boolean;
}

const SelectGroup: React.FC<SelectGroupProps> = ({
    id,
    label,
    value,
    onChange,
    children,
    disabled = false,
}) => {
    return (
        <div className="flex flex-col space-y-1">
            <label
                htmlFor={id}
                className="text-sm font-medium text-text-main dark:text-gray-200"
            >
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full rounded-md border border-input bg-input px-4 py-2 text-text-main shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {children}
            </select>
        </div>
    );
};

export default SelectGroup;
