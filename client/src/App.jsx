import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserRoutes from "./routes/UserRoutes.jsx";
import AdminRoutes from "./routes/AdminRoutes.jsx";
import { useDispatch } from "react-redux";

import { ScrollToTop } from "./utils/ScrollTop";
import { setClearUserStore } from "./api/axiosInstance";
import { logOut } from "./features/user/account/authSlice";

function App() {
  const dispatch = useDispatch();
  setClearUserStore(() => dispatch(logOut()));

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
