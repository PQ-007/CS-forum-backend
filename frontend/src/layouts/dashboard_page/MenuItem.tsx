import {
  BookOutlined,
  HomeOutlined,
  TeamOutlined,
  FormOutlined,
  NotificationOutlined,
  CalendarOutlined,


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
    icon: <CalendarOutlined />,
    label: "Даалгавар",
    path: "/dashboard/student/assignment",
  },
  {
    icon: <FormOutlined />,
    label: "Нийтлэл",
    path: "/dashboard/student/post",
  },
  // {
  //   icon: <BuildOutlined />,
  //   label: "Төсөл",
  //   path: "/dashboard/student/projects",
  // },
  {
    icon: <NotificationOutlined />,
    label: "Мэдэгдэл",
    path: "/dashboard/student/announcements",
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
    icon: <CalendarOutlined />,
    label: "Даалгавар",
    path: "/dashboard/teacher/assignment",
  },
  {
    icon: <TeamOutlined />,
    label: "Сурагчид",
    path: "/dashboard/teacher/students",
  },
];

// Admin Menu Items
export const AdminMenuItems = [

  // {
  //   icon: <DashboardOutlined />,
  //   label: "Хяналтын самбар",
  //   path: "/dashboard/admin/stats",
  // },
  {
    icon: <TeamOutlined />,
    label: "Хэрэглэгчид",
    path: "/dashboard/admin/users-list",
  },
];
