import React from "react";
import logo from "../../assets/diplomind_logo_compressed.png";

const BrandLogo: React.FC = () => {
  return (
    <a href="/">
      <div className="flex items-center cursor-pointer">
        <img
          src={logo}
          alt="Diplomind Logo"
          className="h-12 w-auto object-contain"
        />
      </div>
    </a>
  );
};

export default BrandLogo;
