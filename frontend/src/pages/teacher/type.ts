/* eslint-disable @typescript-eslint/no-unused-vars */
import { message } from "antd";
import { FieldType } from "../../components/Modal";

export const courseFields = [
  {
    name: "title",
    label: "Хичээлийн нэр",
    type: "text" as const,
    rules: [{ required: true, message: "Хичээлийн нэрээ оруулна уу!" }],
  },
  {
    name: "description",
    label: "Тайлбар",
    type: "textarea" as const,
    rules: [{ required: true, message: "Тайлбар оруулна уу!" }],
  },
  {
    name: "year",
    label: "Оюутны курс",
    type: "number" as const,
    rules: [
      { required: true, message: "Хэддүгээр курсийн оюутнуудад заах вэ?" },
      {
        type: "number",
        min: 1,
        max: 5,
        message: "Тоо оруулна уу!",
      },
    ],
  },
];

export const fileFields: FieldType[] = [
  {
    name: "name",
    label: "Файлын нэр",
    type: "text" as const,
    rules: [{ required: true, message: "Файлын нэр оруулна уу!" }],
  },
  {
    name: "file",
    label: "Файл",
    type: "upload" as const,
    rules: [{ required: true, message: "Файл оруулна уу!" }],
    validation: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/png",
        "image/jpeg",
      ],
      accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg",
    },
  },
];

export const sectionFields = [
  {
    name: "title",
    label: "Сэдвийн нэр",
    type: "text" as const,
    rules: [{ required: true, message: "Сэдвийн нэр оруулна уу!" }],
  },
];
