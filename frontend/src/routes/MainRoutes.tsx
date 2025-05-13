import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";
import { Loading } from "../components/Loading";

// Layouts
const AuthLayout = lazy(() => import("../layouts/login_page"));
const DashboardLayout = lazy(() => import("../layouts/dashboard_page"));

// Auth Pages
const LoginPage = lazy(() => import("../pages/auth/login"));
const RegisterPage = lazy(() => import("../pages/auth/register"));

// Student Pages
const StudentHomePage = lazy(() => import("../pages/student/home"));
const StudentCoursePage = lazy(() => import("../pages/student/course"));

// Components
const DashboardContent = lazy(
  () => import("../layouts/dashboard_page/DashboardContent")
);

// Loading component for Suspense fallback
const LoadingFallback = () => (
 <Loading/>
);

const MainRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes - Not accessible when logged in */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route
            path="login"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="register"
            element={
              <ProtectedRoute requireAuth={false}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Routes - Require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
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

          {/* Add additional protected routes here */}
          {/* Example: Profile route */}
          <Route
            path="profile"
            element={
              <DashboardContent mainContent={<div>Profile Content</div>} />
            }
          />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default MainRoutes;
