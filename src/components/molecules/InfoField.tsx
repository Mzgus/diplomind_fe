import React from "react";
import Label from "../atoms/Label";

interface InfoFieldProps {
  label: string;
  value: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
  return (
    <div className="mb-4">
      <Label className="text-sm font-medium text-gray-600">{label}</Label>
      <div className="mt-1 p-3 w-full bg-gray-100 border border-gray-200 rounded-lg text-gray-800">
        {value}
      </div>
    </div>
  );
};

export default InfoField;
