import { FaSpinner } from "react-icons/fa";

export const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-4xl mx-auto text-pink-500 mb-4" />
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
};
