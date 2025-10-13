import { Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import GrantPage from "./grants/GrantPage";
import Header from "./header/Header";
import Users from "./users/Users";
import MyGrantsPage from "./grants/MyGrantsPage";

function MainPage() {
  return (
    <div className="w-full">
      <Header />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-grants" element={<GrantPage />} />
        <Route path="/my-grants" element={<MyGrantsPage />} />
        <Route path="/users" element={<Users />} />
        {/* fallback route */}
        <Route path="*" element={<GrantPage />} />
      </Routes>
    </div>
  );
}

export default MainPage;
