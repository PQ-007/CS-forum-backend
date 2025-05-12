import React from "react";
import DashboardHeader from "../../components/DashboardHeader";

interface DashboardContentProps {
  mainContent: React.ReactNode;
  sidebarContent?: React.ReactNode; // Make sidebarContent optional
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  mainContent,
  sidebarContent,
}) => {
  return (
    <div className="bg-white rounded-lg w-full h-full flex flex-col">
      <DashboardHeader />

      <div className="flex flex-1 min-h-0">
        {" "}
        {/* min-h-0 ensures proper flexbox behavior */}
        {/* Main */}
        <div
          className={`${
            sidebarContent ? "w-[calc(100%-350px)]" : "w-full"
          } p-4 overflow-y-auto no-scrollbar`}
        >
          {mainContent}
        </div>
        {/* Sidebar */}
        {sidebarContent && (
          <div className="w-[350px] overflow-y-auto no-scrollbar bg-gray-100 border-l border-gray-200 p-4">
            {sidebarContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
