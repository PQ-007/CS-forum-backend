import axios from "axios";
import { toast } from "react-toastify";

/**
 * Handles and displays errors using react-toastify.
 */
export const ErrorHandler = (error: unknown): void => {
  let errorMessage = "An unexpected error occurred.";

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    errorMessage =
      typeof responseData === "string"
        ? responseData
        : responseData?.message || error.message;

    console.error("Axios error:", responseData || error.message);
  } else if (error instanceof Error) {
    errorMessage = error.message;
    console.error("Error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }

  toast.error(errorMessage, {
    position: "top-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};
