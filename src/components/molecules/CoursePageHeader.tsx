import React from "react";
import SearchBar from "./SearchBar";
import Button from "../atoms/Button";

interface CoursePageHeaderProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isAdmin: boolean;
    onAdd: () => void;
}

const CoursePageHeader: React.FC<CoursePageHeaderProps> = ({
    searchQuery,
    onSearchChange,
    isAdmin,
    onAdd,
}) => {
    return (
        <div className="flex items-center justify-between mb-8 gap-4">
            <div className="w-3/4">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Rechercher un cours, un projet..."
                />
            </div>
            <div className="w-1/4">
                {isAdmin && (
                    <Button className="w-full" onClick={onAdd}>
                        Ajouter un cours
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CoursePageHeader;
