import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Select,
  Card,
  Tag,
  Typography,
  Dropdown,
  Menu,
  Modal,
  message,
  Form,
  Input as AntInput,
  Select as AntSelect,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import adminService from "../../../service/adminService";

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// Profile interface
export interface Profile {
  id?: string;
  type: string;
  name: string;
  email: string;
  departure: string;
  year: number;
  joinedDate?: string;
}

// Extended interface with key for Table component
interface ProfileTableData extends Profile {
  key: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

const AdminUsersListPage: React.FC = () => {
  // State
  const [profiles, setProfiles] = useState<ProfileTableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterDeparture, setFilterDeparture] = useState<string | null>(null);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 5,
    },
  });
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [availableDepartures, setAvailableDepartures] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminService.getAllUsers();

      // Transform to table data format
      const tableData: ProfileTableData[] = usersData.map((user: any) => ({
        id: user.id,
        type: user.type,
        name: user.name,
        email: user.email,
        departure: user.departure,
        year: user.year,
        joinedDate: user.joinedDate,
        key: user.id || Math.random().toString(),
      }));

      setProfiles(tableData);

      const departures = [
        ...new Set(usersData.map((user: { departure: any }) => user.departure)),
      ];
      setAvailableDepartures(departures as string[]);

      // Update pagination total
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: tableData.length,
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Хэрэглэгчдийн жагсаалтыг ачаалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle table change
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<ProfileTableData> | SorterResult<ProfileTableData>[]
  ) => {
    // Clean filters
    const cleanedFilters: Record<string, FilterValue> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null) {
        cleanedFilters[key] = value as FilterValue;
      }
    });

    setTableParams({
      pagination,
      filters: cleanedFilters,
      ...(sorter && !Array.isArray(sorter)
        ? {
            sortField: sorter.field as string,
            sortOrder:
              sorter.order === "ascend" || sorter.order === "descend"
                ? sorter.order
                : undefined,
          }
        : {}),
    });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Apply filters
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);

        let filteredData: Profile[] = [];

        if (searchText && !filterType && !filterDeparture) {
          // If only searching
          filteredData = await adminService.searchUsers(searchText);
        } else if (filterType && !filterDeparture && !searchText) {
          // If only filtering by type
          filteredData = await adminService.getUsersByType(filterType);
        } else if (filterDeparture && !filterType && !searchText) {
          // If only filtering by departure
          filteredData = await adminService.getUsersByDeparture(
            filterDeparture
          );
        } else {
          // Multiple filters or no filters
          let allUsers = await adminService.getAllUsers();

          // Apply search filter if exists
          if (searchText) {
            allUsers = allUsers.filter(
              (user: { name: string; email: string }) =>
                user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase())
            );
          }

          if (filterType) {
            allUsers = allUsers.filter(
              (user: { type: string }) => user.type === filterType
            );
          }

          if (filterDeparture) {
            allUsers = allUsers.filter(
              (user: { departure: string }) =>
                user.departure === filterDeparture
            );
          }

          filteredData = allUsers;
        }

        // Transform to table data format
        const tableData: ProfileTableData[] = filteredData.map((user) => ({
          ...user,
          key: user.id || Math.random().toString(),
        }));

        setProfiles(tableData);

        // Update pagination
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            current: 1, // Reset to first page on filter change
            total: tableData.length,
          },
        });
      } catch (error) {
        console.error("Error applying filters:", error);
        message.error("Шүүлтүүр хэрэглэхэд алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [searchText, filterType, filterDeparture]);

  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    confirm({
      title: "Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?",
      icon: <ExclamationCircleOutlined />,
      content: "Энэ үйлдлийг буцаах боломжгүй.",
      okText: "Тийм",
      okType: "danger",
      cancelText: "Үгүй",
      onOk: async () => {
        try {
          await adminService.deleteUser(userId);

          // Update local state
          const updatedProfiles = profiles.filter(
            (profile) => profile.id !== userId
          );
          setProfiles(updatedProfiles);

          // Update pagination
          setTableParams({
            ...tableParams,
            pagination: {
              ...tableParams.pagination,
              total: updatedProfiles.length,
            },
          });

          message.success("Хэрэглэгч амжилттай устгагдлаа");
        } catch (error) {
          console.error("Error deleting user:", error);
          message.error("Хэрэглэгчийг устгахад алдаа гарлаа");
        }
      },
    });
  };

  // Handle add user form submit
  const handleAddUser = async (values: Profile) => {
    try {
      // Generate a temporary ID - Firebase will assign the actual ID on creation
      const tempId = Math.random().toString();

      await adminService.createUser(tempId, values);

      message.success("Хэрэглэгч амжилттай нэмэгдлээ");
      setIsAddModalVisible(false);
      form.resetFields();

      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      message.error("Хэрэглэгч нэмэхэд алдаа гарлаа");
    }
  };

  // Handle edit user
  const handleEditUser = (user: Profile) => {
    setCurrentUser(user);
    editForm.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  // Handle edit user form submit
  const handleUpdateUser = async (values: Profile) => {
    if (!currentUser || !currentUser.id) return;

    try {
      await adminService.updateUser(currentUser.id, values);

      message.success("Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ");
      setIsEditModalVisible(false);

      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Хэрэглэгчийн мэдээллийг шинэчлэхэд алдаа гарлаа");
    }
  };

  // Type tag with color mapping
  const getTypeTag = (type: string) => {
    const colorMap: Record<string, string> = {
      Админ: "green",
      Редактор: "blue",
      Харагч: "orange",
    };

    return <Tag color={colorMap[type] || "default"}>{type}</Tag>;
  };

  // Define table columns
  const columns: ColumnsType<ProfileTableData> = [
    {
      title: "Нэр",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Имэйл",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Төрөл",
      dataIndex: "type",
      key: "type",
      render: (type) => getTypeTag(type),
      sorter: (a, b) => a.type.localeCompare(b.type),
    },

    {
      title: " Курс",
      dataIndex: "year",
      key: "year",
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "Бүртгүүлсэн огноо",
      dataIndex: "joinedDate",
      key: "joinedDate",
      sorter: (a, b) => {
        if (!a.joinedDate || !b.joinedDate) return 0;
        return (
          new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime()
        );
      },
    },
    {
      title: "Үйлдэл",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id as string)}
          />
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1">Дэлгэрэнгүй харах</Menu.Item>
                <Menu.Item key="2">Нууц үг шинэчлэх</Menu.Item>
                <Menu.Item key="3">Идэвхгүй болгох</Menu.Item>
              </Menu>
            }
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4}>Хэрэглэгчдийн удирдлага</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalVisible(true)}
          >
            Хэрэглэгч нэмэх
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <Input
            placeholder="Хэрэглэгч хайх"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
          />

          <Select
            placeholder="Төрлөөр шүүх"
            style={{ width: 150 }}
            allowClear
            onChange={(value: string | null) => setFilterType(value)}
          >
            <Option value="admin">Админ</Option>
            <Option value="teacher">Багш</Option>
            <Option value="student">Оюутан</Option>
          </Select>

          <Select
            placeholder="Хэлтсээр шүүх"
            style={{ width: 150 }}
            allowClear
            onChange={(value: string | null) => setFilterDeparture(value)}
          >
            {availableDepartures.map((departure) => (
              <Option key={departure} value={departure}>
                {departure}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={profiles}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        rowKey="id"
        loading={loading}
      />

      {/* Add User Modal */}
      <Modal
        title="Шинэ хэрэглэгч нэмэх"
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUser}
          initialValues={{ type: "Харагч", year: new Date().getFullYear() }}
        >
          <Form.Item
            name="name"
            label="Нэр"
            rules={[{ required: true, message: "Хэрэглэгчийн нэр оруулна уу" }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="email"
            label="Имэйл"
            rules={[
              { required: true, message: "Имэйл хаяг оруулна уу" },
              { type: "email", message: "Зөв имэйл хаяг оруулна уу" },
            ]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="type"
            label="Төрөл"
            rules={[
              { required: true, message: "Хэрэглэгчийн төрөл сонгоно уу" },
            ]}
          >
            <AntSelect>
              <Option value="admin">Админ</Option>
              <Option value="teacher">Багш</Option>
              <Option value="student">Оюутан</Option>
            </AntSelect>
          </Form.Item>
          <Form.Item
            name="departure"
            label="Хэлтэс"
            rules={[{ required: true, message: "Хэлтэс сонгоно уу" }]}
          >
            <AntSelect>
              {availableDepartures.map((departure) => (
                <Option key={departure} value={departure}>
                  {departure}
                </Option>
              ))}
              <Option value="Шинэ хэлтэс">+ Шинэ хэлтэс нэмэх</Option>
            </AntSelect>
          </Form.Item>
          <Form.Item
            name="year"
            label="Жил"
            rules={[{ required: true, message: "Жил оруулна уу" }]}
          >
            <InputNumber min={2000} max={2050} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button onClick={() => setIsAddModalVisible(false)}>
                Цуцлах
              </Button>
              <Button type="primary" htmlType="submit">
                Хадгалах
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Хэрэглэгчийн мэдээлэл засах"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateUser}>
          <Form.Item
            name="name"
            label="Нэр"
            rules={[{ required: true, message: "Хэрэглэгчийн нэр оруулна уу" }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="email"
            label="Имэйл"
            rules={[
              { required: true, message: "Имэйл хаяг оруулна уу" },
              { type: "email", message: "Зөв имэйл хаяг оруулна уу" },
            ]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="type"
            label="Төрөл"
            rules={[
              { required: true, message: "Хэрэглэгчийн төрөл сонгоно уу" },
            ]}
          >
            <AntSelect>
              <Option value="Админ">Админ</Option>
              <Option value="Редактор">Редактор</Option>
              <Option value="Харагч">Харагч</Option>
            </AntSelect>
          </Form.Item>
          <Form.Item
            name="departure"
            label="Хэлтэс"
            rules={[{ required: true, message: "Хэлтэс сонгоно уу" }]}
          >
            <AntSelect>
              {availableDepartures.map((departure) => (
                <Option key={departure} value={departure}>
                  {departure}
                </Option>
              ))}
              <Option value="Шинэ хэлтэс">+ Шинэ хэлтэс нэмэх</Option>
            </AntSelect>
          </Form.Item>
          <Form.Item
            name="year"
            label="Жил"
            rules={[{ required: true, message: "Жил оруулна уу" }]}
          >
            <InputNumber min={2000} max={2050} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button onClick={() => setIsEditModalVisible(false)}>
                Цуцлах
              </Button>
              <Button type="primary" htmlType="submit">
                Хадгалах
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminUsersListPage;
