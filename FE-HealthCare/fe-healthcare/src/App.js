import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginPage from "./HomeComponent/auth/LoginPage";
import DailyMealDashBoard from "./DailyMealComponent/DailyMealDashBoard";
import HealthDashBoard from "./HealthComponent/HealthDashBoard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Route gốc "/" sẽ đưa về LoginPage */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dailymeals" element={<DailyMealDashBoard />} />
                <Route path="/health" element={<HealthDashBoard />} />

                {/* fallback cho các path không tồn tại */}
                <Route path="*" element={<h2>404 - Not Found</h2>} />
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;
