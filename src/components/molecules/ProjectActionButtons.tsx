import React from "react";
import Button from "../atoms/Buttons/Button";
import ButtonEdit from "../atoms/Buttons/ButtonEdit";
import ButtonDelete from "../atoms/Buttons/ButtonDelete";
import Icon from "../atoms/Icon";

interface ProjectActionButtonsProps {
    onAddStep: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ProjectActionButtons: React.FC<ProjectActionButtonsProps> = ({
    onAddStep,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="flex gap-2 flex-shrink-0">
            {/* Ajouter une étape */}
            <Button
                onClick={onAddStep}
                className="text-sm font-medium flex items-center gap-2"
            >
                <Icon name="plus" size="sm" />
                Ajouter une étape
            </Button>

            {/* Éditer */}
            <ButtonEdit onClick={onEdit} title="Éditer ce projet" />

            {/* Supprimer */}
            <ButtonDelete onClick={onDelete} title="Supprimer ce projet" />
        </div>
    );
};

export default ProjectActionButtons;
