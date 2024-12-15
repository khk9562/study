import React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "h-[calc(100vh-150px)] lg:h-full",
  ...props
}) => (
  <div
    className={`bg-white shadow-md rounded-lg p-4 ${className}`}
    {...props}
  />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`mb-4 ${className}`} {...props} />;

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = "",
  ...props
}) => <h3 className={`text-lg font-semibold ${className}`} {...props} />;

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props
) => <div {...props} />;
