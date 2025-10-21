import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminRoutes from "./routes/adminRoutes.jsx";
import UserRoutes from "./routes/userRoutes.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<UserRoutes />}></Route>
        <Route path="/admin/*" element={<AdminRoutes />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
