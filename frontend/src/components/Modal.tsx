/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Modal as AntModal,
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  DatePicker,
  InputNumber,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { validateFile } from "../utils/FileHandler";
import type { Dayjs } from "dayjs";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  title: string;
  fields: any[];
  initialValues?: any;
}

export interface FormModalRef {
  form: ReturnType<typeof Form.useForm>[0];
}

const FormModal = forwardRef<FormModalRef, FormModalProps>(
  ({ isOpen, onClose, onSubmit, title, fields, initialValues = {} }, ref) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);

    // Expose form instance to parent
    useImperativeHandle(ref, () => ({
      form,
    }));

    // Reset form and fileList when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        setFileList([]);
      }
    }, [isOpen, initialValues, form]);

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();

        // Log the form values and fileList for debugging
        console.log("Form values before submit:", values);
        console.log("FileList before submit:", fileList);

        // Check if this is a file upload form
        const hasFileField = fields.some((field) => field.type === "upload");

        if (hasFileField) {
          if (fileList.length === 0) {
            message.error("Файл сонгогдоогүй байна");
            return;
          }
          // Ensure we're using the actual file object
          const file = fileList[0].originFileObj;
          if (!file) {
            message.error("Файл сонгогдоогүй байна");
            return;
          }
          values.file = file;
        }

        // Log the final values being submitted
        console.log("Submitting values:", values);

        onSubmit(values);
        form.resetFields();
        setFileList([]);
        onClose();
      } catch (error) {
        console.error("Form validation failed:", error);
      }
    };

    const renderField = (field: any) => {
      switch (field.type) {
        case "text":
          return (
            <Input
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              showCount={field.showCount}
            />
          );
        case "number":
          return (
            <InputNumber
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              style={{ width: "100%" }}
            />
          );
        case "textarea":
          return (
            <Input.TextArea
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              showCount={field.showCount}
              rows={field.rows || 4}
            />
          );
        case "select":
          return (
            <Select
              placeholder={field.placeholder}
              options={field.options}
              disabled={field.disabled}
              onChange={field.onChange}
            />
          );
        case "date":
          return (
            <DatePicker
              placeholder={field.placeholder}
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
            />
          );
        case "upload":
          return (
            <Upload
              beforeUpload={(file) => {
                if (!validateFile(file, field.validation)) {
                  return Upload.LIST_IGNORE;
                }
                setFileList([{ originFileObj: file }]);
                return false;
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              maxCount={1}
              accept={field.validation?.accept}
            >
              <Button icon={<UploadOutlined />}>Файл сонгох</Button>
            </Upload>
          );
        default:
          return null;
      }
    };

    return (
      <AntModal
        title={title}
        open={isOpen}
        onCancel={() => {
          form.resetFields();
          setFileList([]);
          onClose();
        }}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Болих
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Хадгалах
          </Button>,
        ]}
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
      </AntModal>
    );
  }
);

export default FormModal;
