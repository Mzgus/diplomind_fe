import React from "react";

interface SkillColumnHeaderProps {
    uid: string;
    name: string;
    description?: string;
}

const SkillColumnHeader: React.FC<SkillColumnHeaderProps> = ({ uid, name, description }) => {
    return (
        <th
            key={uid}
            className="sticky top-16 z-20 bg-surface border-b border-r border-border min-w-[60px] w-[60px] h-[180px] align-bottom hover:bg-background transition-colors group cursor-help pb-2"
            title={description || ""}
        >
            <div className="flex items-center justify-center h-full">
                <div className="transform -rotate-45 w-[160px] mb-2 text-left">
                    <span className="text-sm font-medium text-text-main group-hover:text-primary transition-colors block">
                        {name}
                    </span>
                </div>
            </div>
        </th>
    );
};

export default SkillColumnHeader;
