import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { StudentMenuItems, TeacherMenuItems, AdminMenuItems } from "./MenuItem";
import { useAuth } from "../../context/AuthContext";
import "./style.css";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuth();

  // Get user role from userData
  const userRole = userData?.type || "student"; // Default to student if no role found

  // Get the appropriate menu items based on user role
  const getMenuItems = () => {
    switch (userRole) {
      case "teacher":
        return TeacherMenuItems;
      case "admin":
        return AdminMenuItems;
      case "student":
      default:
        return StudentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  // Get the base route for the current role
  const getRoleBaseRoute = () => `/dashboard/${userRole}/home`;

  return (
    <div>
      <div className="w-64 h-screen bg-[#15151E] flex flex-col">
        {/* Logo Section */}
        <div
          onClick={() => navigate(getRoleBaseRoute())}
          className="flex items-center gap-2 cursor-pointer p-4 bg-[#15151E]"
        >
          <img
            src="/svg/cherry-blossom-svgrepo-com.svg"
            alt="Logo"
            className="w-6"
          />
          <span className="text-[20px] text-white font-medium">Sakura</span>
        </div>

        {/* Role Indicator */}
        <div className="px-4 py-2 bg-[#15151E] mb-2">
          <span className="text-[14px] text-gray-400">
            Role: <span className="text-white capitalize">{userRole}</span>
          </span>
        </div>

        {/* Menu Section */}
        <Menu
          mode="vertical"
          theme="dark"
          style={{
            flex: 1,
            backgroundColor: "#15151E",
            padding: 5,
          }}
          selectedKeys={[location.pathname]}
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.path}
              icon={
                <span
                  className="note-icon-wrapper"
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  {item.icon}
                </span>
              }
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </div>
    </div>
  );
};

export default SideBar;
