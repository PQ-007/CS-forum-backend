import { BellOutlined, MailOutlined } from "@ant-design/icons";
import React from "react";

interface DashboardContentProps {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  mainContent,
  sidebarContent,
}) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden w-full h-full flex flex-col">
      {/* Header with Notifications and User Info - Fixed */}
      <div className="w-full flex justify-end items-center border-b border-gray-200">
        <div className="flex items-center gap-4 px-4 py-2 border-r border-gray-200">
          <MailOutlined style={{ color: "#808897", fontSize: "20px" }} />
          <BellOutlined style={{ color: "#808897", fontSize: "20px" }} />
        </div>
        <div className="flex items-center gap-2 px-4 py-2">
          <img
            src="/img/pfp.jpg"
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className="flex flex-col items-start">
            <div className="text-[#353849] text-sm font-medium">Дөлгөөн</div>
            <div className="text-[#808897] text-xs">КУ-4</div>
          </div>
        </div>
      </div>

      {/* Main Layout with Two Sections */}
      <div className="flex flex-1 overflow-hidden">
        {/* Middle Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          <div className="pr-[300px]">{mainContent}</div>
        </div>

        {/* Right Sidebar - Fixed */}
        <div className="w-[350px] p-4 bg-gray-100 border-l border-gray-200 absolute right-2 top-15 bottom-2 overflow-y-auto hide-scrollbar">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
