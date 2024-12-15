// @/components/ui/popover.tsx
import React, { useState, createContext, useContext } from "react";

interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

export const Popover: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const context = useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used within a Popover");

  return (
    <div onClick={() => context.setIsOpen(!context.isOpen)}>{children}</div>
  );
};

export const PopoverContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const context = useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used within a Popover");

  if (!context.isOpen) return null;

  return (
    <div className="absolute z-10 w-64 mt-2 bg-white rounded-md shadow-lg p-4">
      {children}
    </div>
  );
};
