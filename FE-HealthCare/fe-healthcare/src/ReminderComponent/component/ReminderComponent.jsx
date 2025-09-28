import {useEffect, useState} from "react";
import {Badge, Button, Card, Col, Form, Modal, ProgressBar, Row, Spinner} from "react-bootstrap";
import {FaAppleAlt, FaBell, FaBrain, FaCheckCircle, FaClock, FaDumbbell, FaHandsHelping, FaPills} from "react-icons/fa";
import classNames from "classnames";
import * as ReminderService from "../service/ReminderService";

const ReminderComponent = () => {
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState([]);
    const userId = localStorage.getItem("id");
    const [showModal, setShowModal] = useState(false);
    const [reminderTypes, setReminderTypes] = useState([]);
    const [newReminder, setNewReminder] = useState({status: "Pending", typeId: ""});

    const completedCount = reminders.filter(r => r.status === "Completed").length;
    const pendingCount = reminders.filter(r => r.status === "Pending").length;

    useEffect(() => {
        if (userId) {
            fetchData(userId);
        }
    }, [userId]);

    useEffect(() => {
        fetchReminderTypes();
    }, []);

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

    const fetchReminderTypes = async () => {
        try {
            const types = await ReminderService.getAllReminderTypes();
            setReminderTypes(Array.isArray(types) ? types : []);
        } catch (error) {
            console.error("Error fetching reminder types:", error);
        } finally {
            setLoading(false);
        }
    }
    const handleToggleStatus = async (reminderId, currentStatus) => {
        try {
            const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
            const dto = {status: newStatus};

            await ReminderService.updateStatusReminder(reminderId, userId, dto);
            await fetchData(userId);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };
    const handleCreateReminder = async () => {
        try {
            const dto = {
                userId: userId,
                typeId: newReminder.typeId,
                status: newReminder.status,
            };
            await ReminderService.createReminder(dto);
            setShowModal(false);
            await fetchData(userId);
        } catch (error) {
            console.error("Error creating reminder:", error);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: "50vh"}}>
                <Spinner animation="border" variant="primary"/>
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
            Medicine: <FaPills size={30} className="text-primary"/>,
            Workout: <FaDumbbell size={30} className="text-danger"/>,
            Nutrition: <FaAppleAlt size={30} className="text-success"/>,
            Therapy: <FaHandsHelping size={30} className="text-warning"/>,
            "Mental Health": <FaBrain size={30} className="text-info"/>
        };
        return icons[typeName] || <FaBell size={30} className="text-secondary"/>;
    };

    return (
        <div className="p-3">
            <h4 className="mb-4 text-center">Nhắc nhở của bạn</h4>

            <ProgressBar
                now={progress}
                label={`${Math.round(progress)}% hoàn thành`}
                className="mb-4"
            />

            <Row className="mb-4">
                <Col md={6}>
                    <Card className="shadow-sm text-center border-warning">
                        <Card.Body>
                            <FaClock size={28} className="text-warning mb-2"/>
                            <h5 className="fw-bold mb-0">{pendingCount}</h5>
                            <small className="text-muted">Đang chờ</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm text-center border-success">
                        <Card.Body>
                            <FaCheckCircle size={28} className="text-success mb-2"/>
                            <h5 className="fw-bold mb-0">{completedCount}</h5>
                            <small className="text-muted">Hoàn thành</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm mới Reminder</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Loại nhắc nhở</Form.Label>
                            <Form.Select
                                value={newReminder.typeId}
                                onChange={(e) => setNewReminder({ ...newReminder, typeId: e.target.value })}
                            >
                                <option value="">-- Chọn loại --</option>
                                {reminderTypes.map((type) => (
                                    <option key={type.typeId} value={type.typeId}>
                                        {type.typeName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={newReminder.status}
                                onChange={(e) => setNewReminder({ ...newReminder, status: e.target.value })}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleCreateReminder}>Thêm</Button>
                </Modal.Footer>
            </Modal>

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
                                        <FaCheckCircle className="me-1"/>
                                    ) : (
                                        <FaClock className="me-1"/>
                                    )}
                                    {reminder.status}
                                </Badge>

                                <div className="mt-3 d-flex justify-content-center">
                                    <Button
                                        variant={isCompleted ? "outline-warning" : "outline-success"}
                                        size="sm"
                                        className="rounded-pill px-3 d-flex align-items-center"
                                        onClick={() =>
                                            handleToggleStatus(reminder.reminderId, reminder.status)
                                        }
                                    >
                                        {isCompleted ? (
                                            <>
                                                <FaClock className="me-2"/> Đánh dấu Pending
                                            </>
                                        ) : (
                                            <>
                                                <FaCheckCircle className="me-2"/> Đánh dấu Completed
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    );
                })}
                <Col md={6} lg={4}>
                    <Card
                        className="shadow-sm p-3 text-center border-primary d-flex justify-content-center align-items-center"
                        style={{cursor: "pointer", minHeight: "200px"}}
                        onClick={() => setShowModal(true)}>
                        <h5 className="text-primary">+ Thêm mới </h5>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReminderComponent;
