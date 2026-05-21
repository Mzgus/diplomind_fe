import React from "react";

interface SkillColumnHeaderProps {
    uid: string;
    skillId?: number;
    name: string;
    description?: string;
    isHighlighted?: boolean;
}

const SkillColumnHeader: React.FC<SkillColumnHeaderProps> = ({ uid, skillId, name, description, isHighlighted }) => {
    return (
        <th
            key={uid}
            data-uid={uid}
            data-skill-id={skillId}
            className={`sticky top-16 z-20 border-b border-r border-border min-w-[60px] w-[60px] h-[180px] align-bottom hover:bg-background transition-colors group cursor-help pb-2 ${
                isHighlighted ? "bg-primary/10 ring-2 ring-primary ring-inset" : "bg-surface"
            }`}
            title={description || ""}
        >
            <div className="flex items-center justify-center h-full">
                <div className="transform -rotate-45 w-[160px] mb-2 text-left">
                    <span className={`text-sm font-semibold group-hover:text-primary transition-colors block ${
                        isHighlighted ? "text-primary font-bold animate-pulse" : "text-text-main"
                    }`}>
                        {name}
                    </span>
                </div>
            </div>
        </th>
    );
};

export default SkillColumnHeader;
