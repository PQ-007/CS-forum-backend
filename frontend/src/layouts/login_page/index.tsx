import { Outlet } from "react-router-dom";

const AuthPage = () => {
  return (
    <div className="bg-[#15151E] min-h-screen flex justify-center items-center">
      <div className="bg-[#A4ABB8] p-8 rounded-xl w-96 md:w-120">
        <div className="flex flex-col items-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
