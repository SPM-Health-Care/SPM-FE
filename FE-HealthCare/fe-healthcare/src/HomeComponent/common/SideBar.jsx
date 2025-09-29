import React, { useState } from "react";
import { Image, Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaBell, FaUtensils, FaMoon, FaSmile, FaChartBar } from "react-icons/fa";
import logo from "../assets/img/logo/logo.jpg";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);

    const menuItems = [
        { key: "/health", label: "Chỉ số sức khỏe", icon: <FaHome /> },
        { key: "/reminder", label: "Nhắc nhở", icon: <FaBell /> },
        { key: "/dailymeals", label: "Quản lý dinh dưỡng", icon: <FaUtensils /> },
        { key: "/sleep", label: "Giấc ngủ", icon: <FaMoon /> },
        { key: "/mood", label: "Tinh thần", icon: <FaSmile /> },
        { key: "/report", label: "Báo cáo", icon: <FaChartBar /> },
    ];

    const handleNavClick = (path) => {
        setActive(path);
        navigate(path);
    };

    return (
        <div
            className="bg-white border-end shadow-sm min-vh-100 p-3"
            style={{ width: "250px" }}
        >
            <div className="text-center mb-4">
                <Image
                    src={logo}
                    alt="logo"
                    width={100}
                    className="mb-3 rounded-circle shadow-sm"
                />
            </div>

            <Nav className="flex-column gap-2">
                {menuItems.map((item) => (
                    <Nav.Link
                        key={item.key}
                        className={`d-flex align-items-center rounded px-3 py-2 fw-medium ${
                            active === item.key ? "bg-primary text-white shadow-sm" : "text-dark"
                        }`}
                        onClick={() => handleNavClick(item.key)}
                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                    >
                        <span className="me-2 fs-5">{item.icon}</span>
                        {item.label}
                    </Nav.Link>
                ))}
            </Nav>
        </div>
    );
};

export default Sidebar;

