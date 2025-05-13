import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Divider,
  message,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../../../components/button/GoogleLoginButton";
import authService from "../../../service/authService";

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const { email, password } = values;
    try {
      // Firebase login logic
      await authService.login(email, password);
      message.success("Амжилттэй нэвтэрлээ");
      navigate("/dashboard");
    } catch (error: any) {
      message.error(error?.message || "Нэвтрэх явцад алдаа гарлаа.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <Title level={2} className="!text-[#272835] !m-0">
          Тавтай морил
        </Title>
        <Text className="text-gray-600">Өөрийн хаягаараа нэвтэрнэ үү</Text>
      </div>

      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Имэйл хаягаа оруулна уу!" },
            { type: "email", message: "Имэйл хаяг оруулна уу!" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Имэйл хаяг"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Нууц үгээ оруулна уу!" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Нууц үг"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-between">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Намайг сана</Checkbox>
            </Form.Item>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-800"
            >
              Нууц үгээ мартсан
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full bg-[#272835] hover:bg-[#3a3c4f]"
          >
            Нэвтрэх
          </Button>
        </Form.Item>
      </Form>

      <div className="flex items-center justify-center my-4">
        <GoogleLoginButton />
      </div>

      <Divider plain>
        <Text className="text-gray-500">Эсвэл</Text>
      </Divider>

      <div className="text-center">
        <Text className="text-gray-600">
          Хэрвээ хаяггүй бол{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Бүртгүүлэх
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default LoginPage;
