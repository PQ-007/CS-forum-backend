import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { StudentMenuItems } from "./MenuItem";
import "./style.css";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <div className="w-64 h-screen bg-[#15151E] flex flex-col">
        {/* Logo Section */}
        <div
          onClick={() => navigate("/dashboard/home")}
          className="flex items-center gap-2 cursor-pointer p-4 bg-[#15151E]"
        >
          <img
            src="/svg/cherry-blossom-svgrepo-com.svg"
            alt="Logo"
            className="w-6"
          />
          <span className="text-[20px] text-white font-medium">Sakura</span>
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
          {StudentMenuItems.map((item) => (
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
