import React, { useState } from "react";
import {Image, Nav} from "react-bootstrap";
import { HouseDoor, Alarm, CupHot, Moon, ClipboardCheck, BarChart } from "react-bootstrap-icons";
import logo from "../assets/img/logo/logo.jpg";

const Sidebar = () => {
    const [active, setActive] = useState("dashboard");

    return (
        <div
            className="bg-white border-end shadow-sm min-vh-100 p-3"
            style={{width: "250px"}}
        >
            <div className="text-center mb-4 text-white">
                <Image src={logo} alt="logo" width={100} className="mb-3"/>
            </div>
            <Nav className="flex-column gap-2">
                <Nav.Link
                    href="health"
                    className={`d-flex align-items-center rounded px-3 py-2 ${
                        active === "Health" ? "bg-primary text-white" : "text-dark"
                    }`}
                    onClick={() => setActive("Health")}
                >
                    <HouseDoor className="me-2"/>
                    Chỉ số sức khỏe
                </Nav.Link>

                <Nav.Link
                    href="#"
                    className={`d-flex align-items-center rounded px-3 py-2 ${
                        active === "reminder" ? "bg-primary text-white" : "text-dark"
                    }`}
                    onClick={() => setActive("reminder")}
                >
                    <Alarm className="me-2"/>
                    Nhắc nhở & lịch trình
                </Nav.Link>

                <Nav.Link
                    href="/dailymeals"
                    className={`d-flex align-items-center rounded px-3 py-2 ${
                        active === "food" ? "bg-primary text-white" : "text-dark"
                    }`}
                    onClick={() => setActive("food")}
                >
                    <CupHot className="me-2"/>
                    Quản lý dinh dưỡng
                </Nav.Link>

                <Nav.Link
                    href="#"
                    className={`d-flex align-items-center rounded px-3 py-2 ${
                        active === "sleep" ? "bg-primary text-white" : "text-dark"
                    }`}
                    onClick={() => setActive("sleep")}
                >
                    <Moon className="me-2"/>
                    Giấc ngủ & thư giãn
                </Nav.Link>

                <Nav.Link
                    href="#"
                    className={`d-flex align-items-center rounded px-3 py-2 ${
                        active === "habit" ? "bg-primary text-white" : "text-dark"
                    }`}
                    onClick={() => setActive("habit")}
                >
                    <ClipboardCheck className="me-2"/>
                    Thói quen & tinh thần
                </Nav.Link>

                <Nav.Link
                    href="#"
                    className={`d-flex align-items-center rounded px-3 py-2 ${
                        active === "report" ? "bg-primary text-white" : "text-dark"
                    }`}
                    onClick={() => setActive("report")}
                >
                    <BarChart className="me-2"/>
                    Báo cáo & phân tích
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default Sidebar;
