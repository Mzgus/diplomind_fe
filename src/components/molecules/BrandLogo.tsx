import React from "react";
import SkillCraftIcon from "../atoms/SkillCraftIcon";

const BrandLogo: React.FC = () => {
  return (
    <a href="/">
      <div className="flex items-center gap-2 cursor-pointer">
        <SkillCraftIcon />
        <span className="text-2xl font-bold text-blue-600">SKILLCRAFT</span>
      </div>
    </a>
  );
};

export default BrandLogo;
