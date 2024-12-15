import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  ...props
}) => {
  const baseStyle = "px-4 py-2 rounded-md transition-colors duration-300";
  const variantStyles = {
    primary: "bg-[#F25C54] text-white hover:bg-[#D64C47]",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  const combinedClassName = `${baseStyle} ${variantStyles[variant]} ${
    props.disabled ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;

  return <button className={combinedClassName} {...props} />;
};
