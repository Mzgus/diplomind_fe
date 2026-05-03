import React from "react";
import Button from "../atoms/Buttons/Button";
import ButtonEdit from "../atoms/Buttons/ButtonEdit";
import ButtonDelete from "../atoms/Buttons/ButtonDelete";

interface CourseActionButtonsProps {
    onLinkProject: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const CourseActionButtons: React.FC<CourseActionButtonsProps> = ({ onLinkProject, onEdit, onDelete }) => {
    return (
        <div className="flex gap-2">
            {/* Lier un projet */}
            <Button
                onClick={onLinkProject}
                className="text-sm font-medium flex items-center gap-2"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Lier un projet
            </Button>

            {/* Éditer */}
            <ButtonEdit onClick={onEdit} title="Éditer ce cours" />

            {/* Supprimer */}
            <ButtonDelete onClick={onDelete} title="Supprimer ce cours" />
        </div>
    );
};

export default CourseActionButtons;
