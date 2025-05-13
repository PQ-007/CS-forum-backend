import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  message,
  Select,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../../service/authService";
const { Option } = Select;

const { Title, Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const { email, password, name, year } = values;
    try {
      await authService.register(email, password, name, year);
      message.success("Амжилттай бүртгэгдлээ!");
      navigate("/login");
    } catch (error: any) {
      message.error(error?.message || "Бүртгэх явцад алдаа гарлаа.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <Title level={2} className="!text-[#272835] !m-0">
          Бүртгүүлэх
        </Title>
      </div>

      <Form name="register" onFinish={onFinish} size="large" layout="vertical">
        <Form.Item
          name="name"
          rules={[{ required: true, message: "Нэрээ оруулна уу!" }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Нэр"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Имэйл хаягаа оруулна уу!" },
            { type: "email", message: "Имейл хаяг оруулна уу!" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="Имэйл хаяг"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Нууц үгээ оруулна уу!" },
            {
              min: 6,
              message: "Нууц үг нь хамгийн багадаа 6 оронтой байх ёстой!",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Нууц үг"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Нууц үгээ баталгаажуулна уу!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Нууц үг тохирохгүй байна!"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Нууц үг баталгаажуулах"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="year"
          rules={[{ required: true, message: "Курсаа сонгоно уу!" }]}
        >
          <Select
            placeholder="Курс сонгох"
            prefix={<UserOutlined className="text-gray-400" />}
          >
            {[1, 2, 3, 4, 5].map((year) => (
              <Option key={year} value={year}>
                {year}-р курс
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full bg-[#272835] hover:bg-[#3a3c4f]"
          >
            Бүртгүүлэх
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text className="text-gray-500">Эсвэл</Text>
      </Divider>

      <div className="text-center">
        <Text className="text-gray-600">
          Хэрвээ хаягтай бол?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Нэвтрэх
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default RegisterPage;
