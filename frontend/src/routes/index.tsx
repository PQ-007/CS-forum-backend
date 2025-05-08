import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "../pages/auth/register";
import LoginPage from "../pages/auth/login";
import DashboardLayout from "../layouts/dashboard_page";
import AuthPage from "../layouts/login_page";
import StudentHomePage from "../pages/student/home";
import StudentCoursePage from "../pages/student/course";
import DashboardContent from "../layouts/dashboard_page/DashboardContent";

const MainRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AuthPage />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard/home" replace />} />
        <Route
          path="home"
          element={
            <DashboardContent
              mainContent={<StudentHomePage section="main" />}
              sidebarContent={<StudentHomePage section="sidebar" />}
            />
          }
        />
        <Route
          path="course"
          element={
            <DashboardContent
              mainContent={<StudentCoursePage section="main" />}
              sidebarContent={<StudentCoursePage section="sidebar" />}
            />
          }
        />
      </Route>

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default MainRoutes;
