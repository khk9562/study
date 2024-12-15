import React, { createContext, useContext, useState } from "react";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="w-full h-full">{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => (
  <div className={`flex mb-4 border-b ${className || ""}`}>{children}</div>
);

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  disabled,
  children,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const { activeTab, setActiveTab } = context;

  return (
    <button
      onClick={() => setActiveTab(value)}
      disabled={disabled}
      className={`px-4 py-2 ${
        activeTab === value
          ? "border-b-2 border-[#F25C54] text-[#F25C54]"
          : "text-gray-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  const { activeTab } = context;

  return activeTab === value ? <div className="h-full">{children}</div> : null;
};
