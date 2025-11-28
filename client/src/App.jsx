import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./features/user/account/authSlice";
import { setOpenLoginModal } from "./api/axiosInstance";
import { openAuthModal } from "./features/user/account/authSlice";
import { ScrollToTop } from "./utils/ScrollTop";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    setOpenLoginModal(() => () => dispatch(openAuthModal("login")));
  }, [dispatch]);
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
