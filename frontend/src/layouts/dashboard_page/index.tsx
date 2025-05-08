import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar";

const DashboardLayout = () => {
  return (
    <div className="bg-[#15151E] flex h-screen">
      <SideBar />
      <div className="flex-1 p-2 #15151E">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
