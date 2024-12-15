import React from "react";

export const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className = "", ...props }) => (
  <textarea className={`border rounded px-2 py-1 ${className}`} {...props} />
);
