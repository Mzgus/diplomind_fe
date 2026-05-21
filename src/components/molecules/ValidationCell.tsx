import React from "react";

interface ValidationCellProps {
    status?: string;
    onClick: () => void;
    isHighlighted?: boolean;
}

const getStatusStyle = (status?: string): string => {
    switch (status) {
        case "Validé":
            return "bg-success-bg text-success-text border-success-border hover:bg-success-border";
        case "Non validé":
            return "bg-danger-bg text-danger-text border-danger-border hover:bg-danger-border";
        case "Partiellement validé":
            return "bg-warning-bg text-warning-text border-warning-border hover:bg-warning-border";
        default:
            return "bg-background text-text-muted border-border hover:bg-border";
    }
};

const getStatusIcon = (status?: string): React.ReactNode => {
    switch (status) {
        case "Validé":
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case "Non validé":
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case "Partiellement validé":
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        default:
            return <div className="w-2 h-2 rounded-full bg-text-muted/30" />;
    }
};

const ValidationCell: React.FC<ValidationCellProps> = ({ status, onClick, isHighlighted }) => {
    return (
        <td
            onClick={onClick}
            className={`p-2 border-b border-r border-border hover:bg-background transition-all cursor-pointer text-center relative min-w-[60px] ${
                isHighlighted ? "bg-primary/5 ring-1 ring-primary/30 ring-inset shadow-inner" : "bg-surface"
            }`}
        >
            <div
                className={`w-full h-full min-h-[50px] rounded-md flex items-center justify-center border transition-all duration-200 ${getStatusStyle(status)} ${
                    isHighlighted ? "scale-[1.03] shadow-sm" : ""
                }`}
            >
                {getStatusIcon(status)}
            </div>
        </td>
    );
};

export default ValidationCell;
