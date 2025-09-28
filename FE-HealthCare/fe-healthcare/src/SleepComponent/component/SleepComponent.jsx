import * as SleepService from '../service/SleepService';
import React, {useEffect, useState} from 'react';
import {Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner, Stack, Table} from 'react-bootstrap';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {FaEdit, FaPlus} from "react-icons/fa";

const userId = localStorage.getItem('id');
const SleepComponent = () => {
    const [loading, setLoading] = useState(true);
    const [sleepTrackings, setSleepTrackings] = useState([]);

    // modal update
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null); // recordedAt
    const [sleepTime, setSleepTime] = useState("");
    const [wakeTime, setWakeTime] = useState("");

    // modal create
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [newSleepTime, setNewSleepTime] = useState("");
    const [newWakeTime, setNewWakeTime] = useState("");

    useEffect(() => {

        fetchSleepData(userId);

    }, [userId]);

    const fetchSleepData = async (userId: string) => {
        try {
            console.log("Fetching sleep data for userId:", userId);
            const allSleepTrackings = await SleepService.getAllSleepByUserId(userId);
            console.log(allSleepTrackings);
            setSleepTrackings(Array.isArray(allSleepTrackings) ? allSleepTrackings : []);
        } catch (error) {
            console.error("Error fetching sleep data:", error);

        } finally {
            setLoading(false);
        }

    }

    const handleOpenModal = async (row) => {
        setSelectedDate(row.fullDate);
        setSleepTime(row.sleepTimeStr || "");
        setWakeTime(row.wakeTimeStr || "");
        setShowModal(true); // MỞ modal
        try {
            const data = await SleepService.updateSleep(userId, formatRecordedAtForApi(row.fullDate));
            if (data) {
                setSleepTime(data.sleepTime ?? row.sleepTimeStr ?? "");
                setWakeTime(data.wakeTime ?? row.wakeTimeStr ?? "");
            }
        } catch (err) {
            console.warn("Cannot refresh record from API, using local row values. Error:", err);
        }
    };

    const handleUpdate = async () => {
        try {
            //  recordedAt là yyyy-MM-dd, chuyển:
            const recordedAtParam = formatRecordedAtForApi(selectedDate);
            await SleepService.updateSleep(userId, recordedAtParam, {
                sleepTime,
                wakeTime,
            });
            // reload data
            await fetchSleepData(userId);
            setShowModal(false);
        } catch (err) {
            console.error("Error updating sleep:", err);
        }
    };

    // utility: format recordedAt cho API (chuẩn yyyy-MM-dd)
    const formatRecordedAtForApi = (raw) => {
        try {
            // nếu raw đã là "YYYY-MM-DD" thì trả nguyên
            if (!raw) return raw;
            const d = new Date(raw);
            if (isNaN(d)) return raw;
            return d.toISOString().split("T")[0];
        } catch {
            return raw;
        }
    };
    // Hàm hỗ trợ: ghép ngày + giờ => Date object
    const parseDateTime = (dateStr, timeStr) => {
        return new Date(`${dateStr}T${timeStr}:00`);
        // Ví dụ: "2025-09-22" + "23:00" => "2025-09-22T23:00:00"
    };

    // dữ liệu cho charts
    const prepareChartData = () => {
        return sleepTrackings.map(tracking => {
            const sleepDateTime = parseDateTime(tracking.recordedAt, tracking.sleepTime);
            const wakeDateTime = parseDateTime(tracking.recordedAt, tracking.wakeTime);

            // Nếu giờ thức < giờ ngủ -> nghĩa là ngủ qua ngày hôm sau
            if (wakeDateTime <= sleepDateTime) {
                wakeDateTime.setDate(wakeDateTime.getDate() + 1);
            }

            return {
                date: new Date(tracking.recordedAt).toLocaleDateString("vi-VN"),
                sleepDuration: (wakeDateTime - sleepDateTime) / (1000 * 60 * 60),
                sleepTimeDate: sleepDateTime,
                wakeTimeDate: wakeDateTime,
                // giữ nguyên string (dùng để show trong modal và gửi về server)
                sleepTimeStr: tracking.sleepTime,
                wakeTimeStr: tracking.wakeTime,
                fullDate: tracking.recordedAt,
            };
        }).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    };

    // Thống kê tổng quan
    const getSleepStatistics = () => {
        const durations = prepareChartData().map(item => item.sleepDuration);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);

        return {avgDuration, minDuration, maxDuration};
    };

    const chartData = prepareChartData();
    const statistics = getSleepStatistics();

    const handleCreate = async () => {
        try {
            await SleepService.createSleep({
                userId: userId,
                sleepTime: newSleepTime,
                wakeTime: newWakeTime,
                recordedAt: newDate, // yyyy-MM-dd
            });
            await fetchSleepData(userId); // reload
            setShowCreateModal(false);
            setNewDate("");
            setNewSleepTime("");
            setNewWakeTime("");
        } catch (err) {
            console.error("Error creating sleep:", err);
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
    return (
        <Container className="my-4">
            {/*<Button variant="success" className="mb-3" onClick={() => setShowCreateModal(true)}>*/}
            {/*    + Thêm giấc ngủ*/}
            {/*</Button>*/}
            <Stack direction="horizontal" className="mb-3 justify-content-end">
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    <FaPlus className="me-1"/> Thêm mới
                </Button>
            </Stack>
            {/* Thống kê tổng quan */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="stat-card">
                        <Card.Body className="text-center">
                            <h5>Trung bình</h5>
                            <h3 className="text-primary">{statistics.avgDuration.toFixed(1)}h</h3>
                            <small className="text-muted">Giấc ngủ/đêm</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="stat-card">
                        <Card.Body className="text-center">
                            <h5>Ngắn nhất</h5>
                            <h3 className="text-warning">{statistics.minDuration.toFixed(1)}h</h3>
                            <small className="text-muted">Giấc ngủ ngắn nhất</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="stat-card">
                        <Card.Body className="text-center">
                            <h5>Dài nhất</h5>
                            <h3 className="text-success">{statistics.maxDuration.toFixed(1)}h</h3>
                            <small className="text-muted">Giấc ngủ dài nhất</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ đường - Xu hướng giấc ngủ */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Xu hướng thời gian ngủ</h5>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="date"/>
                                    <YAxis label={{value: 'Giờ', angle: -90, position: 'insideLeft'}}/>
                                    <Tooltip
                                        formatter={(value) => [`${value} giờ`, 'Thời gian ngủ']}
                                        labelFormatter={(label) => `Ngày: ${label}`}
                                    />
                                    <Legend/>
                                    <Line
                                        type="monotone"
                                        dataKey="sleepDuration"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Thời gian ngủ"
                                        dot={{fill: '#8884d8', strokeWidth: 2, r: 4}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ cột - So sánh giấc ngủ */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Phân bố thời gian ngủ</h5>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="date"/>
                                    <YAxis label={{value: 'Giờ', angle: -90, position: 'insideLeft'}}/>
                                    <Tooltip
                                        formatter={(value) => [`${value} giờ`, 'Thời gian ngủ']}
                                        labelFormatter={(label) => `Ngày: ${label}`}
                                    />
                                    <Legend/>
                                    <Bar
                                        dataKey="sleepDuration"
                                        fill="#82ca9d"
                                        name="Thời gian ngủ"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Bảng dữ liệu chi tiết */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Lịch sử giấc ngủ chi tiết</h5>
                        </Card.Header>
                        <Card.Body style={{padding: 0}}>
                            <div
                                style={{
                                    maxHeight: "350px",
                                    overflowY: "auto",
                                    display: "block"   // 🔑 để table cuộn dọc
                                }}
                            >
                                <Table striped bordered hover size="sm" className="mb-0">
                                    <thead
                                        className="table-light"
                                        style={{position: "sticky", top: 0, zIndex: 2}}
                                    >
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Giờ ngủ</th>
                                        <th>Giờ thức</th>
                                        <th>Thời gian ngủ</th>
                                        <th>Đánh giá</th>
                                        <th style={{width: "60px"}}></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {chartData.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.date}</td>
                                            <td>{item.sleepTimeStr}</td>
                                            <td>{item.wakeTimeStr}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        item.sleepDuration >= 7
                                                            ? "success"
                                                            : item.sleepDuration >= 5
                                                                ? "warning"
                                                                : "danger"
                                                    }
                                                >
                                                    {item.sleepDuration.toFixed(1)} giờ
                                                </Badge>
                                            </td>
                                            <td>
                                                {item.sleepDuration >= 7
                                                    ? "Tốt"
                                                    : item.sleepDuration >= 5
                                                        ? "Trung bình"
                                                        : "Cần cải thiện"}
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    title="Cập nhật"
                                                    onClick={() => handleOpenModal(item)}
                                                >
                                                    <FaEdit/>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal cập nhật */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật giờ ngủ / giờ thức</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Text
                            className="text-muted mb-2">Ngày: {selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN") : "-"}</Form.Text>

                        <Form.Group className="mb-3">
                            <Form.Label>Giờ ngủ</Form.Label>
                            {/* dùng type="time" để trình duyệt show time picker; value là "HH:MM" */}
                            <Form.Control
                                type="time"
                                value={sleepTime || ""}
                                onChange={(e) => setSleepTime(e.target.value)}
                                placeholder="HH:mm"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Giờ thức</Form.Label>
                            <Form.Control
                                type="time"
                                value={wakeTime || ""}
                                onChange={(e) => setWakeTime(e.target.value)}
                                placeholder="HH:mm"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleUpdate}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal tạo mới */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm giấc ngủ mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày</Form.Label>
                            <Form.Control
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Giờ ngủ</Form.Label>
                            <Form.Control
                                type="time"
                                value={newSleepTime}
                                onChange={(e) => setNewSleepTime(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Giờ thức</Form.Label>
                            <Form.Control
                                type="time"
                                value={newWakeTime}
                                onChange={(e) => setNewWakeTime(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleCreate}>
                        Tạo mới
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
export default SleepComponent;