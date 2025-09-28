import {useEffect, useMemo, useState} from "react";
import {Button, Card, Col, Form, Modal, ProgressBar, Row, Spinner,} from "react-bootstrap";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {FaAngry, FaEdit, FaFrown, FaGrinBeam, FaMeh, FaPlus, FaSmile,} from "react-icons/fa";
import dayjs from "dayjs";
import * as MoodServices from "../service/MoodService";
import {Record} from "react-bootstrap-icons";

// Map stress level sang icon
const getStressIcon = (level: number) => {
    switch (level) {
        case 1:
            return <FaGrinBeam className="text-success" size={30}/>; // Rất vui
        case 2:
            return <FaSmile className="text-info" size={30}/>; // Vui
        case 3:
            return <FaMeh className="text-warning" size={30}/>; // Bình thường
        case 4:
            return <FaFrown className="text-danger" size={30}/>; // Buồn
        case 5:
            return <FaAngry className="text-dark" size={30}/>; // Tức giận
        default:
            return <FaMeh className="text-secondary" size={30}/>; // Mặc định
    }
};

const MOOD_ICONS: Record<string, JSX.Element> = {
    Happy: <FaGrinBeam className="text-success" size={24}/>,
    Tired: <FaFrown className="text-danger" size={24}/>,
    Relaxed: <FaSmile className="text-info" size={24}/>,
    Stressed: <FaAngry className="text-dark" size={24}/>,
    Neutral: <FaMeh className="text-warning" size={24}/>,
};

const FIXED_MOODS = ["Happy", "Tired", "Relaxed", "Stressed", "Neutral"];

const MoodComponent = () => {
    const userId = localStorage.getItem("id");
    const [loading, setLoading] = useState(true);
    const [moods, setMoods] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedMood, setSelectedMood] = useState(null);
    const [formData, setFormData] = useState({
        stressLevel: 1,
        mood: FIXED_MOODS[0],
    });
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        if (userId) {
            fetchMoods(userId);
        }
    }, [userId]);

    const fetchMoods = async (userId: string) => {
        setLoading(true);
        try {
            const allMoods = await MoodServices.getAllMoodsByUserId(userId);
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

    const handleUpdateClick = (mood: any) => {
        setSelectedMood(mood);
        setFormData({
            stressLevel: Number(mood.stressLevel),
            mood: String(mood.mood),
            recordedAt: dayjs(mood.recordedAt).format("YYYY-MM-DD"),
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!userId || !selectedMood) return;
        setSaving(true);
        try {
            console.log("Sending update:", {
                userId,
                moodId: selectedMood.moodId,
                payload: formData,
            });

            const updated = await MoodServices.updateMoodTracking(
                userId,
                Number(selectedMood.moodId),
                formData
            );
            console.log("Update response:", updated);
            await fetchMoods(userId);
            setShowModal(false);
        } catch (err) {
            console.log("Error updating mood:", err);
        } finally {
            setSaving(false);
        }
    };


    const moodCounts = useMemo(() => {
        const counts = {};
        (moods || []).forEach(m => {
            const k = m?.mood ?? "Unknown";
            counts[k] = (counts[k] || 0) + 1;
        });
        FIXED_MOODS.forEach(k => {
            if (!counts[k]) counts[k] = 0;
        });
        return counts;
    }, [moods]);

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
        <div className="p-4">
            <h4 className="mb-4 text-center">Theo dõi Tâm trạng</h4>

            <Row className="mb-4 justify-content-between">
                {FIXED_MOODS.map((mood) => (
                    <Col key={mood} xs={6} sm={4} md={2} lg className="mb-2">
                        <Card className="shadow-sm text-center">
                            <Card.Body>
                                <div className="mb-2">{MOOD_ICONS[mood]}</div>
                                <h6>{mood}</h6>
                                <div className="fw-bold">{moodCounts[mood]}</div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Biểu đồ stressLevel theo ngày */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <h6 className="text-center mb-3">Biểu đồ Stress Level</h6>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={moods.slice().reverse() /* xa nhất → gần nhất */}>
                            <Line type="monotone" dataKey="stressLevel" stroke="#007bff" strokeWidth={2}/>
                            <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5"/>
                            <XAxis dataKey="recordedAt" tickFormatter={(date) => dayjs(date).format("DD/MM")}/>
                            <YAxis domain={[1, 5]}/>
                            <Tooltip labelFormatter={(date) => dayjs(date).format("DD/MM/YYYY")}/>
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
                            <ProgressBar
                                now={(mood.stressLevel / 5) * 100}
                                label={`Stress: ${mood.stressLevel}/5`}
                                variant="info"
                                className="mb-2"
                            />
                            <div className="text-muted small mb-2">
                                {dayjs(mood.recordedAt).format("DD/MM/YYYY")}
                            </div>
                            <Button variant="outline-primary" size="sm" onClick={() => handleUpdateClick(mood)}>
                                <FaEdit className="me-1"/> Cập nhật
                            </Button>
                        </Card>
                    </Col>
                ))}

                {/* Card thêm mới */}
            </Row>
            {/* Modal thêm mới */}
            {/* Modal chỉnh sửa */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa Mood</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Stress Level</Form.Label>
                            {/* dùng string value để tránh mismatch kiểu */}
                            <Form.Select
                                value={String(formData.stressLevel)}
                                onChange={(e) =>
                                    setFormData({...formData, stressLevel: Number(e.target.value)})
                                }
                            >
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <option key={level} value={String(level)}>
                                        {level}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Mood</Form.Label>
                            <Form.Select
                                value={formData.mood}
                                onChange={(e) => setFormData({...formData, mood: e.target.value})}
                            >
                                {FIXED_MOODS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Spinner animation="border" size="sm"/>{" "}
                                <span className="ms-1">Đang lưu...</span>
                            </>
                        ) : (
                            "Lưu"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MoodComponent;
