import { useEffect, useState } from "react";
import { Card, Row, Col, Badge, Spinner, ProgressBar } from "react-bootstrap";
import {
    FaPills,
    FaDumbbell,
    FaAppleAlt,
    FaBrain,
    FaHandsHelping,
    FaBell,
    FaCheckCircle,
    FaClock
} from "react-icons/fa";
import classNames from "classnames";
import * as ReminderService from "../service/ReminderService";

const ReminderComponent = () => {
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState([]);
    const userId = localStorage.getItem("id");

    useEffect(() => {
        if (userId) {
            fetchData(userId);
        }
    }, [userId]);

    const fetchData = async (userId) => {
        try {
            const allReminders = await ReminderService.getAllRemindersByUserId(userId);
            setReminders(Array.isArray(allReminders) ? allReminders : []);
        } catch (error) {
            console.error("Error fetching reminders:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Đang tải dữ liệu...</span>
            </div>
        );
    }

    // % hoàn thành
    const completed = reminders.filter(r => r.status === "Completed").length;
    const progress = reminders.length > 0 ? (completed / reminders.length) * 100 : 0;

    // Hàm chọn icon theo typeName (dễ mở rộng)
    const getTypeIcon = (typeName) => {
        const icons = {
            Medicine: <FaPills size={30} className="text-primary" />,
            Workout: <FaDumbbell size={30} className="text-danger" />,
            Nutrition: <FaAppleAlt size={30} className="text-success" />,
            Therapy: <FaHandsHelping size={30} className="text-warning" />,
            "Mental Health": <FaBrain size={30} className="text-info" />
        };
        return icons[typeName] || <FaBell size={30} className="text-secondary" />;
    };

    return (
        <div className="p-3">
            <h4 className="mb-4 text-center">Nhắc nhở của bạn</h4>

            {/* Progress tổng */}
            <ProgressBar
                now={progress}
                label={`${Math.round(progress)}% hoàn thành`}
                className="mb-4"
            />

            <Row className="g-4">
                {reminders.map((reminder) => {
                    const isCompleted = reminder.status === "Completed";
                    return (
                        <Col md={6} lg={4} key={reminder.reminderId}>
                            <Card
                                className={classNames("shadow-sm", "p-3", "text-center", {
                                    "border-success": isCompleted,
                                    "border-warning": !isCompleted,
                                })}
                            >
                                <div className="mb-3">{getTypeIcon(reminder.typeName)}</div>

                                <h6>{reminder.typeName}</h6>
                                <Badge bg={isCompleted ? "success" : "warning"} className="mb-2">
                                    {isCompleted ? (
                                        <FaCheckCircle className="me-1" />
                                    ) : (
                                        <FaClock className="me-1" />
                                    )}
                                    {reminder.status}
                                </Badge>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default ReminderComponent;
