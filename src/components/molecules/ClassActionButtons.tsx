import React from "react";
import ButtonEdit from "../atoms/Buttons/ButtonEdit";
import ButtonDelete from "../atoms/Buttons/ButtonDelete";

interface ClassActionButtonsProps {
    onEdit: () => void;
    onDelete: () => void;
}

const ClassActionButtons: React.FC<ClassActionButtonsProps> = ({ onEdit, onDelete }) => {
    return (
        <div className="flex gap-2 flex-shrink-0">
            <ButtonEdit onClick={onEdit} title="Éditer cette classe" />
            <ButtonDelete onClick={onDelete} title="Supprimer cette classe" />
        </div>
    );
};

export default ClassActionButtons;
