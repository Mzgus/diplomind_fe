import React from "react";
import SearchBar from "./SearchBar";
import Button from "../atoms/Buttons/Button";

interface ClassPageHeaderProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    canEdit: boolean;
    onAdd: () => void;
}

const ClassPageHeader: React.FC<ClassPageHeaderProps> = ({
    searchQuery,
    onSearchChange,
    canEdit,
    onAdd,
}) => {
    return (
        <div className="flex items-center justify-between mb-8 gap-4">
            <div className="w-3/4">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Rechercher une classe, une année..."
                />
            </div>
            <div className="w-1/4">
                {canEdit && (
                    <Button className="w-full" onClick={onAdd}>
                        Ajouter une classe
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ClassPageHeader;
