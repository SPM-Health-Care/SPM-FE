import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, ProgressBar } from "react-bootstrap";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FaSmile, FaMeh, FaFrown, FaTired, FaAngry } from "react-icons/fa";
import dayjs from "dayjs";
import * as MoodServices from "../service/MoodService";

// Map stress level sang icon
const getStressIcon = (level: number) => {
    switch (level) {
        case 1: return <FaSmile className="text-success" size={30} />;
        case 2: return <FaMeh className="text-info" size={30} />;
        case 3: return <FaTired className="text-warning" size={30} />;
        case 4: return <FaFrown className="text-danger" size={30} />;
        case 5: return <FaAngry className="text-dark" size={30} />;
        default: return <FaMeh className="text-secondary" size={30} />;
    }
};

const MoodComponent = () => {
    const userId = localStorage.getItem("id");
    const [loading, setLoading] = useState(true);
    const [moods, setMoods] = useState([]);

    useEffect(() => {
        if (userId) {
            fetchMoods(userId);
        }
    }, [userId]);

    const fetchMoods = async (userId: string) => {
        try {
            const allMoods = await MoodServices.getAllMoodsByUserId(userId);

            // Sort ngày: gần nhất → xa nhất
            const sorted = (Array.isArray(allMoods) ? allMoods : []).sort(
                (a, b) => dayjs(b.recordedAt).unix() - dayjs(a.recordedAt).unix()
            );

            setMoods(sorted);
        } catch (error) {
            console.error("Error fetching moods:", error);
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

    return (
        <div className="p-4">
            <h4 className="mb-4 text-center">Theo dõi Tâm trạng</h4>

            {/* Biểu đồ stressLevel theo ngày */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <h6 className="text-center mb-3">Biểu đồ Stress Level</h6>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={moods.slice().reverse() /* để chart hiển thị từ xa nhất → gần nhất */}>
                            <Line type="monotone" dataKey="stressLevel" stroke="#007bff" strokeWidth={2} />
                            <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
                            <XAxis dataKey="recordedAt" tickFormatter={(date) => dayjs(date).format("DD/MM")} />
                            <YAxis domain={[1, 5]} />
                            <Tooltip labelFormatter={(date) => dayjs(date).format("DD/MM/YYYY")} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>

            {/* Danh sách moods */}
            <Row className="g-3">
                {moods.map((mood) => (
                    <Col md={6} lg={4} key={mood.moodId}>
                        <Card className="shadow-sm p-3 text-center h-100">
                            <div className="mb-2">{getStressIcon(mood.stressLevel)}</div>
                            <h6 className="fw-bold">{mood.mood}</h6>

                            {/* Thanh progress thay vì text */}
                            <ProgressBar
                                now={(mood.stressLevel / 5) * 100}
                                label={`Stress: ${mood.stressLevel}/5`}
                                variant="info"
                                className="mb-2"
                            />

                            <div className="text-muted small">
                                {dayjs(mood.recordedAt).format("DD/MM/YYYY")}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default MoodComponent;
