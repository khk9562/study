import React from "react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  className = "",
  label,
  checked,
  onCheckedChange,
  ...props
}) => {
  const baseStyle =
    "h-4 w-4 rounded border-gray-300 text-[#F25C54] focus:ring-[#F25C54]";
  const combinedClassName = `${baseStyle} ${
    props.disabled ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={combinedClassName}
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      {label && (
        <label
          htmlFor={props.id}
          className={`ml-2 text-sm text-gray-700 ${
            props.disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
