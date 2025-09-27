import * as SleepService from '../service/SleepService';
import React, {useEffect, useState} from 'react';
import {Badge, Card, Col, Container, Row, Spinner, Table} from 'react-bootstrap';
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

const userId = localStorage.getItem('id');
const SleepComponent = () => {
    const [loading, setLoading] = useState(true);
    const [sleepTrackings, setSleepTrackings] = useState([]);

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
    // Hàm hỗ trợ: ghép ngày + giờ => Date object
    const parseDateTime = (dateStr, timeStr) => {
        return new Date(`${dateStr}T${timeStr}:00`);
        // Ví dụ: "2025-09-22" + "23:00" => "2025-09-22T23:00:00"
    };

// Chuẩn bị dữ liệu cho charts
    const prepareChartData = () => {
        return sleepTrackings.map(tracking => {
            const sleepDateTime = parseDateTime(tracking.recordedAt, tracking.sleepTime);
            const wakeDateTime = parseDateTime(tracking.recordedAt, tracking.wakeTime);

            // Nếu giờ thức < giờ ngủ -> nghĩa là ngủ qua ngày hôm sau
            if (wakeDateTime <= sleepDateTime) {
                wakeDateTime.setDate(wakeDateTime.getDate() + 1);
            }

            return {
                date: new Date(tracking.recordedAt).toLocaleDateString('vi-VN'),
                sleepDuration: (wakeDateTime - sleepDateTime) / (1000 * 60 * 60), // giờ
                sleepTime: sleepDateTime,
                wakeTime: wakeDateTime,
                fullDate: tracking.recordedAt
            };
        }).reverse(); // đảo ngược để hiển thị mới nhất cuối
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
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped hover>
                                    <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Giờ ngủ</th>
                                        <th>Giờ thức</th>
                                        <th>Thời gian ngủ</th>
                                        <th>Đánh giá</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {chartData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.date}</td>
                                            <td>{new Date(item.sleepTime).toLocaleTimeString('vi-VN')}</td>
                                            <td>{new Date(item.wakeTime).toLocaleTimeString('vi-VN')}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        item.sleepDuration >= 7 ? 'success' :
                                                            item.sleepDuration >= 5 ? 'warning' : 'danger'
                                                    }
                                                >
                                                    {item.sleepDuration.toFixed(1)} giờ
                                                </Badge>
                                            </td>
                                            <td>
                                                {item.sleepDuration >= 7 ? 'Tốt' :
                                                    item.sleepDuration >= 5 ? 'Trung bình' : 'Cần cải thiện'}
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
        </Container>
    );
}
export default SleepComponent;