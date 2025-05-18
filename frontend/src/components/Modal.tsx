/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Modal as AntModal,
  Form,
  Input,
  Button,
  Upload,

  Select,
  DatePicker,
  InputNumber,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { validateFile } from "../utils/FileHandler";
import type { UploadFile } from "antd/es/upload/interface";


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
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);

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
        setUploadError(null);
      }
    }, [isOpen, initialValues, form]);

    // Update form value when fileList changes
    React.useEffect(() => {
      const fileField = fields.find((f) => f.type === "upload");
      if (fileField && fileList.length > 0) {
        form.setFieldValue(fileField.name, fileList[0].originFileObj);
      } else if (fileField) {
        form.setFieldValue(fileField.name, undefined);
      }
    }, [fileList, fields, form]);

    const handleSubmit = async () => {
      try {
        setUploadError(null);
        const values = await form.validateFields();

        // Check if this is a file upload form
        const hasFileField = fields.some((field) => field.type === "upload");
        const fileField = fields.find((f) => f.type === "upload");

        if (hasFileField && fileField) {
          if (fileList.length === 0) {
            setUploadError("Файл сонгоно уу!");
            return;
          }

          const file = fileList[0].originFileObj;
          if (!file) {
            setUploadError("Файл сонгогдоогүй байна");
            return;
          }

          // Validate file before submission
          try {
            const isValid = validateFile(file, {
              maxSize: 10 * 1024 * 1024, // 10MB
              accept: fileField.validation?.accept,
            });

            if (!isValid) {
              setUploadError("Файл хэмжээ эсвэл төрөл буруу байна");
              return;
            }

            // Ensure file is in form values
            values[fileField.name] = file;
          } catch (error) {
            if (error instanceof Error) {
              setUploadError(error.message);
            } else {
              setUploadError("Файл шалгахад алдаа гарлаа");
            }
            return;
          }
        }

        onSubmit(values);
        form.resetFields();
        setFileList([]);
        setUploadError(null);
        onClose();
      } catch (error) {
        console.error("Form validation failed:", error);
        if (error instanceof Error) {
          setUploadError(error.message);
        }
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
            <>
              <Upload
                beforeUpload={(file) => {
                  try {
                    const isValid = validateFile(file, {
                      maxSize: field.validation?.maxSize || 10 * 1024 * 1024,
                      accept: field.validation?.accept,
                    });

                    if (!isValid) {
                      return Upload.LIST_IGNORE;
                    }

                    const newFile = {
                      originFileObj: file,
                      name: file.name,
                      status: "done" as const,
                      uid: file.uid,
                    };
                    setFileList([newFile]);
                    setUploadError(null);
                    return false;
                  } catch (error) {
                    if (error instanceof Error) {
                      setUploadError(error.message);
                    } else {
                      setUploadError("Файл шалгахад алдаа гарлаа");
                    }
                    return Upload.LIST_IGNORE;
                  }
                }}
                fileList={fileList}
                onRemove={() => {
                  setFileList([]);
                  setUploadError(null);
                  form.setFieldValue(field.name, undefined);
                }}
                maxCount={1}
                accept={field.validation?.accept}
              >
                <Button icon={<UploadOutlined />}>Файл сонгох</Button>
              </Upload>
              {field.description && (
                <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>
                  {field.description}
                </div>
              )}
              {uploadError && (
                <div style={{ marginTop: 8, color: "#ff4d4f", fontSize: 13 }}>
                  {uploadError}
                </div>
              )}
            </>
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
          setUploadError(null);
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
              validateStatus={
                uploadError && field.type === "upload" ? "error" : undefined
              }
              help={
                uploadError && field.type === "upload" ? uploadError : undefined
              }
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
