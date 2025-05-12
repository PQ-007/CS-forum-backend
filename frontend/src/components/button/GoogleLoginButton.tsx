import React from "react";
import authService from "../../service/authService";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
const GoogleLoginButton: React.FC = () => {
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      await authService.loginWithGoogle();
      message.success("Google нэвтрэлт амжилттай!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="group flex items-center justify-center gap-3  max-w-xs px-5 py-3 rounded-xl  bg-white font-medium hover:bg-gray-250  cursor-pointer transition duration-200 ease-in-out"
    >
      <img src="../img/google-logo.jpg" alt="Google logo" className="w-5 h-5" />
      <span className="text-sm">Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
