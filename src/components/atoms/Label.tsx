import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, ...props }) => {
  return <label {...props}>{children}</label>;
};

export default Label;
