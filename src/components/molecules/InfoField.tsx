import React from "react";
import Label from "../atoms/Label";

interface InfoFieldProps {
  label: string;
  value: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
  return (
    <div className="mb-4">
      <Label className="text-sm font-medium text-text-muted">{label}</Label>
      <div className="mt-1 p-3 w-full bg-background border border-border rounded-lg text-text-main">
        {value}
      </div>
    </div>
  );
};

export default InfoField;
