import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoginPage from "./HomeComponent/auth/LoginPage";
import DailyMealDashBoard from "./DailyMealComponent/DailyMealDashBoard";
import HealthDashBoard from "./HealthComponent/HealthDashBoard";
import SleepDashBoard from "./SleepComponent/SleepDashBoard";
import ReminderDashBoard from "./ReminderComponent/ReminderDashBoard";
import MoodDashBoard from "./MoodComponent/MoodDashBoard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* route gốc "/" đưa về LoginPage */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* các dashboard */}
                <Route path="/dailymeals" element={<DailyMealDashBoard />} />
                <Route path="/health" element={<HealthDashBoard />} />
                <Route path="/sleep" element={<SleepDashBoard />} />
                <Route path="/reminder" element={<ReminderDashBoard />} />
                <Route path="/mood" element={<MoodDashBoard />} />

                {/* fallback cho path không tồn tại */}
                <Route path="*" element={<h2>404 - Not Found</h2>} />
            </Routes>

            {/* toast để show thông báo */}
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;

