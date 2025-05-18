import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import StudentProfilePage from "../pages/student/profile";
import StudentSettingsPage from "../pages/student/settings";
import { Loading } from "../components/Loading";
import StudentPostPage from "../pages/student/post";

import { TabProvider } from "../context/TabContext";

import AddArticle from "../components/post/article/AddArticle";
import ReadArticle from "../components/post/article/ReadArticle";
import AdminStatsPage from "../pages/admin/stats";
import AdminUsersListPage from "../pages/admin/users-list";

// Layouts
const AuthLayout = lazy(() => import("../layouts/login_page"));
const DashboardLayout = lazy(() => import("../layouts/dashboard_page"));

// Auth Pages
const LoginPage = lazy(() => import("../pages/auth/login"));
const RegisterPage = lazy(() => import("../pages/auth/register"));

// Components
const DashboardContent = lazy(
  () => import("../layouts/dashboard_page/DashboardContent")
);

// Student Pages
const StudentHomePage = lazy(() => import("../pages/student/home"));
const StudentCoursePage = lazy(() => import("../pages/student/course"));
const StudentAssignmentPage = lazy(() => import("../pages/student/assignment"));
// Teacher Pages - Uncomment when implementing
// const TeacherHomePage = lazy(() => import("../pages/teacher/home"));
const TeacherCoursePage = lazy(() => import("../pages/teacher/course"));
const TeacherAssignmentPage = lazy(() => import("../pages/teacher/assignment"));
const TeacherStudentsPage = lazy(() => import("../pages/teacher/students"));
// Admin Pages - Uncomment when implementing
// const AdminHomePage = lazy(() => import("../pages/admin/home"));
// const AdminDashboardPage = lazy(() => import("../pages/admin/dashboard"));

// Loading component for Suspense fallback
const LoadingFallback = () => <Loading />;

const RoleBasedRoutes: React.FC = () => {
  const { userData, loading } = useAuth();

  // Get the user role - default to student if no role found
  const userRole = userData?.type || "student";

  // Show loading while authentication is being checked
  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
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

        {/* Dashboard root - redirects to appropriate role dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to={`/dashboard/${userRole}/home`} replace />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute roleRequired="student">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/dashboard/student/home" replace />}
          />
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
          <Route
            path="assignment"
            element={
              <DashboardContent
                mainContent={<StudentAssignmentPage section="main" />}
              />
            }
          />
          <Route
            path="post"
            element={
              <TabProvider>
                <DashboardContent
                  mainContent={<StudentPostPage />}
             
                />
              </TabProvider>
            }
          />
          <Route
            path="post/article/write/:id"
            element={<DashboardContent mainContent={<AddArticle/>} />}
          />
          <Route
            path={`post/article/read/:id`}
            element={
              <DashboardContent mainContent={<ReadArticle/>} />
            }
          />
          <Route
            path="projects"
            element={<DashboardContent mainContent={<p>projects page</p>} />}
          />
          <Route
            path={`profile/:uid`}
            element={<DashboardContent mainContent={<StudentProfilePage />} />}
          />
          <Route
            path={`settings/:uid`}
            element={<DashboardContent mainContent={<StudentSettingsPage />} />}
          />
          <Route
            path={`announcements`}
            element={<DashboardContent mainContent={<p>Medeelel Go</p>} />}
          />
        </Route>

        {/* Teacher Routes - These are commented out because the components aren't implemented yet */}
        <Route
          path="/dashboard/teacher"
          element={
            <ProtectedRoute roleRequired="teacher">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/dashboard/teacher/home" replace />}
          />
          <Route
            path="home"
            element={
              <DashboardContent
                mainContent={
                  <div>Teacher Home Page (Create this component)</div>
                }
                sidebarContent={<div>Teacher Sidebar Content</div>}
              />
            }
          />
          <Route
            path="course"
            element={
              <DashboardContent
                mainContent={<TeacherCoursePage section="main" />}
                sidebarContent={<TeacherCoursePage section="sidebar" />}
              />
            }
          />
          <Route
            path="assignment"
            element={
              <DashboardContent
                mainContent={<TeacherAssignmentPage section="main" />}
              />
            }
          />
          <Route
            path="students"
            element={
              <DashboardContent
                mainContent={<TeacherStudentsPage section="main" />}
              />
            }
          />
        </Route>

        {/* Admin Routes - These are placeholder routes until you implement the components */}
        <Route  
          path="/dashboard/admin"
          element={
            <ProtectedRoute roleRequired="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/dashboard/admin/home" replace />}
          />
          <Route
            path="home"
            element={
              <DashboardContent
                mainContent={<div>Admin Home Page (Create this component)</div>}
                sidebarContent={<div>Admin Sidebar Content</div>}
              />
            }
          />
          <Route
            path="stats"
            element={
              <DashboardContent
                mainContent={
                  <AdminStatsPage/>
                }
                sidebarContent={<div>Admin Dashboard Sidebar</div>}
              />
            }
          />
          <Route
            path="users-list"
            element={
              <DashboardContent
                mainContent={<AdminUsersListPage/>}
                sidebarContent={<div>Admin Dashboard Sidebar</div>}
              />
            }
          />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default RoleBasedRoutes;
