import React, { useState } from "react";
import {
  BellOutlined,
  MailOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../service/authService";
import SearchField from "./SearchField";

const DashboardHeader: React.FC = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const userName = userData?.displayName || "Guest";
  const userEmail = user?.email || "";

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
      message.success("Системээс гарлаа");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfile = () => {
    navigate(`/dashboard/student/profile/${user?.uid}`);
  };

  const handleSettings = () => {
    navigate(`/dashboard/student/settings/${user?.uid}`);
  };

  const handleSearch = () => {
    console.log("Search for:", query);
    // Add your search logic here
    navigate(`/dashboard/${userData?.type || "student"}/settings/${user?.uid}`);
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={handleProfile}>
        Профайл
      </Menu.Item>
      <Menu.Item
        key="settings"
        icon={<SettingOutlined />}
        onClick={handleSettings}
      >
        Тохиргоо
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Гарах
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="w-full flex justify-between items-center border-b border-gray-200">
      <div className="py-2 px-4">
        <SearchField
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          placeholder="Search..."
        />
      </div>

      <div className="flex">
        <div className="flex items-center gap-4 px-4 py-2 border-r border-gray-200">
          <MailOutlined style={{ color: "#808897", fontSize: "20px" }} />
          <BellOutlined style={{ color: "#808897", fontSize: "20px" }} />
        </div>

        {/* User Dropdown */}
        <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
          <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                {userData?.displayName?.charAt(0)}
              </div>
            )}

            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <div className="text-[#353849] text-sm font-medium flex items-center gap-1">
                  {userName}
                </div>{" "}
                {/* Role Badge */}
                <div
                  className={`px-3 py-1 rounded-full w-fit text-white  text-xs font-medium ml-2 ${
                    userData?.type === "admin"
                      ? "bg-red-600"
                      : userData?.type === "teacher"
                      ? "bg-purple-500"
                      : userData?.type === "student"
                      ? "bg-blue-400"
                      : "bg-gray-600"
                  }`}
                >
                  <span className="capitalize">
                    {userData?.type === "admin"
                      ? "Админ"
                      : userData?.type === "teacher"
                      ? "Багш"
                      : userData?.type === "student"
                      ? "Оюутан"
                      : "Зочин"}
                  </span>
                </div>
              </div>
              <div className="text-[#808897] text-xs truncate max-w-[150px]">
                {userEmail}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default DashboardHeader;
