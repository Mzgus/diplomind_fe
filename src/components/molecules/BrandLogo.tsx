import React from 'react';
import SkillCraftIcon from '../atoms/SkillCraftIcon';

const BrandLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <SkillCraftIcon />
      <span className="text-2xl font-bold text-blue-600">SKILLCRAFT</span>
    </div>
  );
};

export default BrandLogo;