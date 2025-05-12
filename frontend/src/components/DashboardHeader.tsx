import React from "react";
import {
  BellOutlined,
  MailOutlined,
  DownOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../service/authService";

const DashboardHeader: React.FC = () => {
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
    navigate(`/dashboard/${userData.type}/profile/${user?.uid}`);
  };
  
  const handleSettings = () => {
    navigate(`/dashboard/${userData.type}/settings/${user?.uid}`);
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
    <div className="w-full flex justify-end items-center border-b border-gray-200">
      <div className="flex items-center gap-4 px-4 py-2 border-r border-gray-200">
        <MailOutlined style={{ color: "#808897", fontSize: "20px" }} />
        <BellOutlined style={{ color: "#808897", fontSize: "20px" }} />
      </div>

      {/* User Dropdown */}
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md">
          <img
            src={user?.photoURL || "/img/pfp.jpg"}
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex flex-col items-start">
            <div className="text-[#353849] text-sm font-medium flex items-center gap-1">
              {userName} <DownOutlined className="text-xs" />
            </div>
            <div className="text-[#808897] text-xs truncate max-w-[150px]">
              {userEmail}
            </div>
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default DashboardHeader;
