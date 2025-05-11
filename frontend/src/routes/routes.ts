import { lazy } from "react";
import { IRoute } from "../components/types";

// Auth Routes
const Login = lazy(() => import("../pages/auth/login"));
const Register = lazy(() => import("../pages/auth/register"));

// Student Routes
const StudentHome = lazy(() => import("../pages/student/home"));
const StudentCourse = lazy(() => import("../pages/student/course"));

// Define public routes (auth pages)
export const authRoutes: IRoute[] = [
  {
    key: "login",
    path: "login",
    component: Login,
  },
  {
    key: "register",
    path: "register",
    component: Register,
  },
];

// Define protected routes (dashboard pages)
export const dashboardRoutes: IRoute[] = [
  {
    key: "home",
    path: "home",
    component: StudentHome,
  },
  {
    key: "course",
    path: "course",
    component: StudentCourse,
  },
  // Add more routes as needed
];

// Define role-based routes
export const studentRoutes: IRoute[] = dashboardRoutes;

export const teacherRoutes: IRoute[] = [
  // Teacher-specific routes
  // Example:
  // {
  //   key: "manage-courses",
  //   path: "manage-courses",
  //   component: ManageCourses,
  // },
];

export const adminRoutes: IRoute[] = [
  // Admin-specific routes
  // Example:
  // {
  //   key: "admin-dashboard",
  //   path: "admin-dashboard",
  //   component: AdminDashboard,
  // },
];

// Helper function to get routes based on user role
export const getRoutesByRole = (role: string): IRoute[] => {
  switch (role) {
    case "teacher":
      return teacherRoutes;
    case "admin":
      return adminRoutes;
    case "student":
    default:
      return studentRoutes;
  }
};
