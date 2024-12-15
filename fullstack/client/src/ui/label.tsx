import React from "react";

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className = "",
  ...props
}) => <label className={`block mb-1 ${className}`} {...props} />;
