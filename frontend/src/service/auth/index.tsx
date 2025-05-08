import axios from "axios";
import { User } from "../type";
import { toast } from "react-toastify";

import { ErrorHandler } from "/final_projet/Sakura/frontend/utils/ErrorHandler";

const api = "http:localhost:5167/api";

export const loginAPI = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    const data = await axios.post<User>(`${api}/auth/login`, {
      email,
      password,
      name,
    });
    return data;
  } catch (error) {
    ErrorHandler(error);
    toast.error("Registration failed. Please try again.");
  }
};

export const registerAPI = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    const data = await axios.post<User>(`${api}/auth/register`, {
      email,
      password,
      name,
    });
    return data;
  } catch (error) {
    ErrorHandler(error);
    toast.error("Registration failed. Please try again.");
  }
};

export const logoutAPI = async () => {
  try {
    await axios.post(`${api}/auth/logout`);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    ErrorHandler(error);
    toast.error("Logout failed. Please try again.");
  }
};
