import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  className = "",
  children,
  value,
  onValueChange,
  ...props
}) => (
  <select
    className={`border rounded px-2 py-1 ${className}`}
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    {...props}
  >
    {children}
  </select>
);

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => <div {...props}>{children}</div>;

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  children,
  placeholder,
  ...props
}) => <span {...props}>{children || placeholder}</span>;

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => <div {...props}>{children}</div>;

export const SelectItem: React.FC<
  React.OptionHTMLAttributes<HTMLOptionElement>
> = ({ children, ...props }) => <option {...props}>{children}</option>;
