import {useEffect, useState} from "react";
import * as HealthService from "../service/HealthService";
import {Card, Col, Container, Row, Spinner, Table} from "react-bootstrap";
import {
    Area,
    AreaChart,
    CartesianGrid, Legend,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {FaBullseye, FaHeartbeat} from "react-icons/fa";

const HealthComponent = () => {
    const userId = localStorage.getItem("id");
    const [loading, setLoading] = useState(true);
    const [healthMetrics, setHealthMetrics] = useState([]);
    const [healthGoals, setHealthGoals] = useState();

    useEffect(() => {
        if (userId) {
            fetchHealthMetrics(userId);
            fetchHealthGoals(userId);
        }
    }, [userId]);

    const fetchHealthMetrics = async (userId: string) => {
        try {
            const AllHealthMetrics = await HealthService.getAllHealthMetricsByUserId(userId);
            setHealthMetrics(Array.isArray(AllHealthMetrics) ? AllHealthMetrics : []);
            console.log(AllHealthMetrics);
        } catch (error) {
            console.error("Error fetching health metrics:", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchHealthGoals = async (userId: string) => {
        try {
            const AllHealthGoals = await HealthService.getHealthGoalsByUserId(userId);

            if (Array.isArray(AllHealthGoals) && AllHealthGoals.length > 0) {
                const latestGoal = AllHealthGoals[AllHealthGoals.length - 1];
                setHealthGoals(latestGoal);
            } else {
                setHealthGoals(null);
            }

            console.log(AllHealthGoals);
        } catch (error) {
            console.error("Error fetching health goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const getLatestHeartRate = () => {
        if (!healthMetrics || healthMetrics.length === 0) return 0;

        // sort theo ngày giảm dần
        const sorted = [...healthMetrics].sort(
            (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)
        );

        // tìm entry đầu tiên có heartRate
        const latest = sorted.find((m) => m.heartRate !== null && m.heartRate !== undefined);

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
        { name: "Hiện tại", value: latestHeartRate, fill: "#198754" }, // xanh lá
        { name: "Trung bình", value: averageHeartRate, fill: "#0d6efd" }, // xanh dương
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: "50vh"}}>
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
                    <Card className="shadow-sm text-center p-3">
                        <FaBullseye size={30} className="text-primary mb-2"/>
                        <h6>Mục tiêu Cân nặng</h6>
                        <h4>{healthGoals?.weightGoal || "N/A"} kg</h4>
                    </Card>
                </Col>

                {/* Blood Pressure Goal */}
                <Col md={6}>
                    <Card className="shadow-sm text-center p-3">
                        <FaHeartbeat size={30} className="text-danger mb-2"/>
                        <h6>Mục tiêu Huyết áp</h6>
                        <h4>{healthGoals?.bpGoal || "N/A"} mmHg</h4>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mt-2">
                {/* AreaChart Blood Pressure */}
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="fw-bold bg-light">❤️ Huyết áp theo thời gian</Card.Header>
                        <Card.Body style={{height: "300px"}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={healthMetrics.filter(m => m.metricType === "Blood Pressure")}>
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
                                    <Area type="monotone" dataKey="bloodPressure" stroke="#dc3545"
                                          fill="url(#bpColor)"/>
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
                        <Card.Body style={{ height: "350px" }}>
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <Spinner animation="border" />
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
                                            label={{ position: "insideStart", fill: "#fff" }}
                                        />
                                        <Tooltip />
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

            {/* Table */}
            <Row className="g-4 mt-2">
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="fw-bold bg-light">📑 Lịch sử số liệu</Card.Header>
                        <Card.Body style={{maxHeight: "300px", overflowY: "auto"}}>
                            <Table striped hover responsive className="align-middle text-center">
                                <thead className="table-primary">
                                <tr>
                                    <th>Loại</th>
                                    <th>Giá trị</th>
                                    <th>Ngày</th>
                                    <th>Min</th>
                                    <th>Max</th>
                                </tr>
                                </thead>
                                <tbody>
                                {healthMetrics.length > 0 ? healthMetrics.map((m, idx) => (
                                    <tr key={idx}>
                                        <td>{m.metricType}</td>
                                        <td className="fw-bold">{m.bloodPressure || m.heartRate}</td>
                                        <td>{new Date(m.recordedAt).toLocaleDateString("vi-VN")}</td>
                                        <td>{m.minValue}</td>
                                        <td>{m.maxValue}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-muted py-3">Không có dữ liệu</td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
export default HealthComponent;
