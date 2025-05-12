/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Modal, Form, Input, InputNumber, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { handleFileUpload, validateFile } from "../../utils/FileHandler";
import { ModalFormValues } from './types';

interface FileValidationProps {
  maxSize?: number;
  allowedTypes?: string[];
  accept?: string;
}

export interface FieldType {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "upload";
  rules?: any[];
  props?: Record<string, any>;
  validation?: FileValidationProps;
}

export interface FormModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ModalFormValues) => void | Promise<void>;
  fields: FieldType[];
  initialValues?: Partial<ModalFormValues>;
}

const FormModal: React.FC<FormModalProps> = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  fields,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  React.useEffect(() => {
    if (isOpen && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [isOpen, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // If there's a file field, get the file from fileList
      const fileField = fields.find((f) => f.type === "upload");
      if (fileField && fileList[0]) {
        values[fileField.name] = fileList[0].originFileObj;
      }
      onSubmit(values);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const renderField = (field: FieldType) => {
    switch (field.type) {
      case "textarea":
        return <Input.TextArea rows={4} {...field.props} />;
      case "number":
        return <InputNumber style={{ width: "100%" }} {...field.props} />;
      case "upload":
        return (
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={(file) => {
              const isValid = validateFile(file, {
                maxSize: field.validation?.maxSize,
                allowedTypes: field.validation?.allowedTypes,
              });
              if (isValid) {
                handleFileUpload(file).then((fileData) => {
                  if (fileData) {
                    form.setFieldValue(field.name, fileData);
                  }
                });
              }
              return false;
            }}
            maxCount={1}
            accept={field.validation?.accept}
            {...field.props}
          >
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
              <UploadOutlined className="text-2xl mb-2" />
              <div>Файл сонгох эсвэл чирэх</div>
            </div>
          </Upload>
        );
      default:
        return <Input {...field.props} />;
    }
  };

  return (
    <Modal
      title={title}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={() => {
        onClose();
        form.resetFields();
        setFileList([]);
      }}
      okText="Нэмэх"
      cancelText="Болих"
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules}
          >
            {renderField(field)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default FormModal;
