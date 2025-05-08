import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainRoutes from "./routes";

const App = () => {
  return (
    <>
      <MainRoutes />
      <ToastContainer aria-label="Notification" />
    </>
  );
};

export default App;
