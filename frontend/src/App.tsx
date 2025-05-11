import { BrowserRouter } from "react-router-dom";
import RoleBasedRoutes from "./routes/RoleBasedRoutes";

const App = () => {
  return (
    <BrowserRouter>
      <RoleBasedRoutes />
      {/* For role-based routing, replace MainRoutes with RoleBasedRoutes */}
      {/* <RoleBasedRoutes /> */}
    </BrowserRouter>
  );
};

export default App;
