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
    <div className="bg-white rounded-lg overflow-hidden w-full h-full flex flex-col">
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Middle Content Area */}
        <div
          className={`${
            sidebarContent ? "flex-1 pr-[300px]" : "w-full"
          } overflow-y-auto p-4 relative`}
        >
          {mainContent}
        </div>

        {/* Right Sidebar */}
        {sidebarContent && (
          <div className="w-[350px] p-4 bg-gray-100 border-l border-gray-200 absolute right-2 top-15 bottom-2 overflow-y-auto hide-scrollbar">
            {sidebarContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
