/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  getAllowedExtensions,
  getAllowedFileTypesDescription,
} from "../../utils/FileHandler";

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
    type: "select" as const,
    options: [
      { label: "1-р курс", value: 1 },
      { label: "2-р курс", value: 2 },
      { label: "3-р курс", value: 3 },
      { label: "4-р курс", value: 4 },
      { label: "5-р курс", value: 5 },
    ],
    rules: [
      { required: true, message: "Хэддүгээр курсийн оюутнуудад заах вэ?" },
    ],
  },
];

export const fileFields = [
  {
    name: "name",
    label: "Файлын нэр",
    type: "text" as const,
    rules: [{ required: true, message: "Файлын нэрээ оруулна уу!" }],
  },
  {
    name: "file",
    label: "Файл",
    type: "upload" as const,
    rules: [{ required: true, message: "Файлаа оруулна уу!" }],
    validation: {
      maxSize: 10 * 1024 * 1024, // 10MB
      accept: getAllowedExtensions(),
    },
    description: `Зөвшөөрөгдсөн файлын төрлүүд: ${getAllowedFileTypesDescription()}`,
  },
];

export const sectionFields = [
  {
    name: "title",
    label: "Сэдвийн нэр",
    type: "text" as const,
    rules: [{ required: true, message: "Сэдвийн нэрээ оруулна уу!" }],
  },
];
