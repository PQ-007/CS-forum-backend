import {
  BookOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

// Student Menu Items
export const StudentMenuItems = [
  {
    icon: <HomeOutlined />,
    label: "Үндсэн цэс",
    path: "/dashboard/student/home",
  },
  {
    icon: <BookOutlined />,
    label: "Хичээл",
    path: "/dashboard/student/course",
  },
  {
    icon: <UserOutlined />,
    label: "Профайл",
    path: "/dashboard/student/profile",
  },
];

// Teacher Menu Items
export const TeacherMenuItems = [
  {
    icon: <HomeOutlined />,
    label: "Үндсэн цэс",
    path: "/dashboard/teacher/home",
  },
  {
    icon: <BookOutlined />,
    label: "Хичээл",
    path: "/dashboard/teacher/course",
  },
  {
    icon: <TeamOutlined />,
    label: "Сурагчид",
    path: "/dashboard/teacher/students",
  },
  {
    icon: <UserOutlined />,
    label: "Профайл",
    path: "/dashboard/teacher/profile",
  },
];

// Admin Menu Items
export const AdminMenuItems = [
  {
    icon: <HomeOutlined />,
    label: "Үндсэн цэс",
    path: "/dashboard/admin/home",
  },
  {
    icon: <DashboardOutlined />,
    label: "Хяналтын самбар",
    path: "/dashboard/admin/dashboard",
  },
  {
    icon: <TeamOutlined />,
    label: "Хэрэглэгчид",
    path: "/dashboard/admin/users",
  },
  {
    icon: <SettingOutlined />,
    label: "Тохиргоо",
    path: "/dashboard/admin/settings",
  },
];
