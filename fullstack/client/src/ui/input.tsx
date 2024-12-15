import React from "react";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = "",
  ...props
}) => <input className={`border rounded px-2 py-1 ${className}`} {...props} />;
