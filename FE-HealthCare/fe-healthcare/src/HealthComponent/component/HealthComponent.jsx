import {useEffect, useState} from "react";
import * as HealthService from "../service/HealthService";
import {Button, Card, Col, Container, Form, ListGroup, Modal, Row, Spinner,} from "react-bootstrap";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {FaBullseye, FaEdit, FaHeartbeat} from "react-icons/fa";

const HealthComponent = () => {
    const userId = localStorage.getItem("id");
    const [loading, setLoading] = useState(true);
    const [healthMetrics, setHealthMetrics] = useState([]);
    const [healthGoals, setHealthGoals] = useState();

    // Modal state for Goals
    const [showModal, setShowModal] = useState(false);
    const [goalType, setGoalType] = useState(null);
    const [newValue, setNewValue] = useState("");

    // Modal state for Metrics
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [metricField, setMetricField] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchHealthMetrics(userId);
            fetchHealthGoals(userId);
        }
    }, [userId]);

    // Fetch Metrics
    const fetchHealthMetrics = async (userId) => {
        try {
            const AllHealthMetrics = await HealthService.getAllHealthMetricsByUserId(userId);
            setHealthMetrics(Array.isArray(AllHealthMetrics) ? AllHealthMetrics : []);
        } catch (error) {
            console.error("Error fetching health metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Goals
    const fetchHealthGoals = async (userId) => {
        try {
            const AllHealthGoals = await HealthService.getHealthGoalsByUserId(userId);

            if (Array.isArray(AllHealthGoals) && AllHealthGoals.length > 0) {
                const latestGoal = AllHealthGoals[AllHealthGoals.length - 1];
                setHealthGoals(latestGoal);
            } else {
                setHealthGoals(null);
            }
        } catch (error) {
            console.error("Error fetching health goals:", error);
        } finally {
            setLoading(false);
        }
    };

    // Modal Goals
    const handleOpenModal = (type) => {
        setGoalType(type);
        setNewValue(
            type === "weight" ? healthGoals?.weightGoal || "" : healthGoals?.bpGoal || ""
        );
        setShowModal(true);
    };

    const handleSaveGoal = async () => {
        if (!userId || !goalType) return;

        const updatedData = {
            ...healthGoals,
            weightGoal:
                goalType === "weight" ? Number(newValue) : healthGoals?.weightGoal,
            bpGoal: goalType === "bp" ? Number(newValue) : healthGoals?.bpGoal,
        };

        try {
            await HealthService.updateGoal(userId, updatedData);
            setHealthGoals(updatedData);
            setShowModal(false);
        } catch (error) {
            console.error("Error updating goal:", error);
        }
    };

    const handleOpenMetricModal = (metric, field) => {
        setSelectedMetric(metric);
        setMetricField(field);

        if (field === "heartRate") {
            setEditValue(metric.heartRate != null ? String(metric.heartRate) : "");
        } else if (field === "bloodPressure") {
            setEditValue(metric.bloodPressure != null ? String(metric.bloodPressure) : "");
        } else {
            setEditValue("");
        }

        setShowMetricModal(true);
    };


    const formatDateOnly = (dateTimeString) => {
        if (!dateTimeString) return "";
        return dateTimeString.split("T")[0]; // lấy phần yyyy-MM-dd
    };

    const handleSaveMetric = async () => {
        if (!userId || !selectedMetric || !metricField) return;

        const updatedMetric = { ...selectedMetric };
        if (metricField === "heartRate") {
            updatedMetric.heartRate = Number(editValue);
        } else if (metricField === "bloodPressure") {
            updatedMetric.bloodPressure = Number(editValue);
        }

        try {
            const dateOnly = formatDateOnly(selectedMetric.recordedAt);

            await HealthService.updateHealthMetric(userId, dateOnly, updatedMetric);

            setHealthMetrics((prev) =>
                prev.map((m) => {
                    const sameDate = formatDateOnly(m.recordedAt) === dateOnly;
                    const sameType =
                        (metricField === "heartRate" && m.heartRate != null) ||
                        (metricField === "bloodPressure" && m.bloodPressure != null);

                    if (sameDate && sameType) {
                        return { ...m, ...updatedMetric };
                    }
                    return m;
                })
            );

            setShowMetricModal(false);
            setSelectedMetric(null);
            setMetricField(null);
            setEditValue("");
        } catch (err) {
            console.error("Error updating metric:", err);
        }
    };



    // HeartRate Helpers
    const getLatestHeartRate = () => {
        if (!healthMetrics || healthMetrics.length === 0) return 0;
        const sorted = [...healthMetrics].sort(
            (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)
        );
        const latest = sorted.find(
            (m) => m.heartRate !== null && m.heartRate !== undefined
        );
        return latest ? latest.heartRate : 0;
    };

    const getAverageHeartRate = () => {
        if (!healthMetrics || healthMetrics.length === 0) return 0;
        const heartRates = healthMetrics
            .filter((m) => m.heartRate !== null && m.heartRate !== undefined)
            .map((m) => m.heartRate);
        if (heartRates.length === 0) return 0;
        const sum = heartRates.reduce((acc, val) => acc + val, 0);
        return Math.round(sum / heartRates.length);
    };

    const averageHeartRate = getAverageHeartRate();
    const latestHeartRate = getLatestHeartRate();

    const chartData = [
        {name: "Hiện tại", value: latestHeartRate, fill: "#198754"},
        {name: "Trung bình", value: averageHeartRate, fill: "#0d6efd"},
    ];

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{minHeight: "50vh"}}
            >
                <Spinner animation="border" variant="primary"/>
                <span className="ms-2">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <Container fluid className="mt-4">
            <Row className="g-4">
                {/* Weight Goal */}
                <Col md={6}>
                    <Card className="shadow-sm text-center p-3 h-100">
                        <FaBullseye size={34} className="text-primary mb-2"/>
                        <h6 className="fw-bold">Mục tiêu Cân nặng</h6>
                        <h4 className="mb-3">{healthGoals?.weightGoal ?? "N/A"} kg</h4>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center mx-auto"
                            onClick={() => handleOpenModal("weight")}
                        >
                            <FaEdit className="me-1"/> Cập nhật
                        </Button>
                    </Card>
                </Col>

                {/* Blood Pressure Goal */}
                <Col md={6}>
                    <Card className="shadow-sm text-center p-3 h-100">
                        <FaHeartbeat size={34} className="text-danger mb-2"/>
                        <h6 className="fw-bold">Mục tiêu Huyết áp</h6>
                        <h4 className="mb-3">{healthGoals?.bpGoal ?? "N/A"} mmHg</h4>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="d-flex align-items-center mx-auto"
                            onClick={() => handleOpenModal("bp")}
                        >
                            <FaEdit className="me-1"/> Cập nhật
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* MODAL UPDATE GOAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật mục tiêu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>
                                {goalType === "weight"
                                    ? "Mục tiêu Cân nặng (kg)"
                                    : "Mục tiêu Huyết áp (mmHg)"}
                            </Form.Label>
                            <Form.Control
                                type="number"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveGoal}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL UPDATE METRIC */}
            <Modal show={showMetricModal} onHide={() => setShowMetricModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {metricField === 'heartRate' ? '💓 Cập nhật Nhịp tim' :
                            metricField === 'bloodPressure' ? '❤️ Cập nhật Huyết áp' : 'Cập nhật số liệu'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedMetric ? (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày ghi nhận</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={new Date(selectedMetric.recordedAt).toLocaleDateString("vi-VN")}
                                    disabled
                                    readOnly
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    {metricField === 'heartRate' ? 'Nhịp tim (bpm)' :
                                        metricField === 'bloodPressure' ? 'Huyết áp (mmHg)' : 'Giá trị'}
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                    min="0"
                                />
                            </Form.Group>
                        </Form>
                    ) : (
                        <div>Không có dữ liệu để chỉnh sửa.</div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowMetricModal(false);
                        setMetricField(null);
                    }}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveMetric}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>


            <Row className="g-4 mt-2">
                {/* AreaChart Blood Pressure */}
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="fw-bold bg-light">
                            ❤️ Huyết áp theo thời gian
                        </Card.Header>
                        <Card.Body style={{height: "300px"}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={healthMetrics.filter((m) => m.metricType === "Blood Pressure")}>
                                    <defs>
                                        <linearGradient id="bpColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#dc3545" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#dc3545" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="recordedAt"/>
                                    <YAxis domain={[60, 140]}/>
                                    <Tooltip/>
                                    <Area
                                        type="monotone"
                                        dataKey="bloodPressure"
                                        stroke="#dc3545"
                                        fill="url(#bpColor)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Radial Heart Rate */}
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="fw-bold bg-light">
                            💓 Nhịp tim hiện tại so với trung bình
                        </Card.Header>
                        <Card.Body style={{height: "350px"}}>
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <Spinner animation="border"/>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="40%"
                                        outerRadius="100%"
                                        barSize={20}
                                        data={chartData}
                                    >
                                        <RadialBar
                                            minAngle={15}
                                            background
                                            clockWise
                                            dataKey="value"
                                            label={{position: "insideStart", fill: "#fff"}}
                                        />
                                        <Tooltip/>
                                        <Legend
                                            iconSize={12}
                                            layout="vertical"
                                            verticalAlign="middle"
                                            align="right"
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* HISTORY LIST AS CARDS */}
            <Row className="g-4 mt-2">
                {/* Heart Rate */}
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="fw-bold bg-light">💓 Lịch sử Nhịp tim</Card.Header>
                        <Card.Body style={{maxHeight: "300px", overflowY: "auto"}}>
                            <ListGroup>
                                {healthMetrics.map((m, idx) => (
                                    m.heartRate && (
                                        <ListGroup.Item
                                            key={idx}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <strong>{m.heartRate} bpm</strong>
                                                <div className="text-muted small">
                                                    {new Date(m.recordedAt).toLocaleDateString("vi-VN")}
                                                </div>
                                                {m.minValue && m.maxValue && (
                                                    <small>Min: {m.minValue} | Max: {m.maxValue}</small>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => handleOpenMetricModal(m, "heartRate")}
                                            >
                                                <FaEdit/>
                                            </Button>

                                        </ListGroup.Item>
                                    )
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Blood Pressure */}
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="fw-bold bg-light">❤️ Lịch sử Huyết áp</Card.Header>
                        <Card.Body style={{maxHeight: "300px", overflowY: "auto"}}>
                            <ListGroup>
                                {healthMetrics.map((m, idx) => (
                                    m.bloodPressure && (
                                        <ListGroup.Item
                                            key={idx}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <strong>{m.bloodPressure} mmHg</strong>
                                                <div className="text-muted small">
                                                    {new Date(m.recordedAt).toLocaleDateString("vi-VN")}
                                                </div>
                                                {m.minValue && m.maxValue && (
                                                    <small>Min: {m.minValue} | Max: {m.maxValue}</small>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleOpenMetricModal(m, "bloodPressure")}
                                            >
                                                <FaEdit/>
                                            </Button>
                                        </ListGroup.Item>
                                    )
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default HealthComponent;


