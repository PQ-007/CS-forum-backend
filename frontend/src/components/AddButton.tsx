import { PlusOutlined } from "@ant-design/icons";
import { ButtonHTMLAttributes } from "react";

interface AddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  hoverColor?: string;
  activeColor?: string;
  borderColor?: string;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  transparent?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({
  children,
  text = "Add",
  icon = <PlusOutlined />,
  bgColor = "bg-blue-500",
  textColor = "text-white",
  hoverColor = "hover:bg-blue-600",
  activeColor = "active:bg-blue-700",
  borderColor = "border-transparent",
  fullWidth = false,
  size = "md",
  transparent = false,
  className = "",
  onClick,
  type = "button",
  style = {},
  ...rest
}) => {
  // Size classes
  const sizeClasses: Record<"sm" | "md" | "lg", string> = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-6 text-lg",
  };

  // Background handling
  const backgroundClass = transparent ? "bg-transparent" : bgColor;

  return (
    <button
      type={type as "button" | "submit" | "reset"}
      onClick={onClick}
      className={`
        ${fullWidth ? "w-full" : ""}
        ${backgroundClass}
        ${textColor}
        ${hoverColor}
        ${activeColor}
        ${borderColor}
        ${sizeClasses[size]}
        border rounded-md transition-colors duration-200
        flex items-center justify-center gap-2 font-medium
        focus:outline-none focus:ring-1 focus:ring-blue-200
        ${className}
      `}
      style={style}
      {...rest}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children || text}
    </button>
  );
};

export default AddButton;
