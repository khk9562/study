// table.tsx
import React from "react";

export const Table: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">{children}</table>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <thead className="bg-gray-50">{children}</thead>;

export const TableBody: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;

export const TableRow: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => <tr className={className}>{children}</tr>;

export const TableHead: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <th
    scope="col"
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export const TableCell: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <td className={"px-6 py-4 whitespace-nowrap" + className}>{children}</td>
);
