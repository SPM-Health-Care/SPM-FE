import {useEffect, useState} from "react";
import * as DailyMealService from "../service/DailyMealService";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {Accordion, Badge, Card, Col, Container, Row, Spinner, Table} from "react-bootstrap";
import {FaChartBar, FaChartPie, FaUtensils} from "react-icons/fa";

const COLORS = ["#0d6efd", "#20c997", "#ffc107", "#dc3545", "#6f42c1"];

const DailyMealComponent = () => {
    const userId = localStorage.getItem("id");
    const [dailyMeals, setDailyMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupedMeals, setGroupedMeals] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (userId) {
            getDailyMeals(userId);
        }
    }, [userId]);

    const getDailyMeals = async (userId: string) => {
        try {
            const allDailyMeals = await DailyMealService.getAllDailyMealsByUserId(userId);
            const meals = Array.isArray(allDailyMeals) ? allDailyMeals : [];
            setDailyMeals(meals);

            // gom theo ngày
            const grouped: any = {};
            meals.forEach((meal) => {
                const date = meal.recordedAt
                    ? new Date(meal.recordedAt).toLocaleDateString("vi-VN")
                    : "Không rõ ngày";
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(meal);
            });

            setGroupedMeals(grouped);

            // lấy danh sách ngày đã sort giảm dần
            const sortedDays = Object.keys(grouped).sort(
                (a, b) =>
                    new Date(b.split("/").reverse().join("-")).getTime() -
                    new Date(a.split("/").reverse().join("-")).getTime()
            );

            if (sortedDays.length > 0) {
                setSelectedDate(sortedDays[0]); // chọn ngày mới nhất
            }
        } catch (error) {
            console.error("Error fetching daily meals:", error);
        } finally {
            setLoading(false);
        }
    };

    // tính toán tổng và trung bình
    const totalCalories = dailyMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

    // danh sách ngày đã sort giảm dần
    const days = Object.keys(groupedMeals).sort(
        (a, b) =>
            new Date(b.split("/").reverse().join("-")).getTime() -
            new Date(a.split("/").reverse().join("-")).getTime()
    );

    const avgCalories = days.length > 0 ? (totalCalories / days.length).toFixed(1) : 0;

    // dữ liệu cho bar chart (tổng calo/ngày)
    const chartData = days.map((date) => ({
        date,
        totalCalories: groupedMeals[date].reduce((s: number, m: any) => s + m.calories, 0),
    }));

    // dữ liệu cho pie chart (tỷ lệ món ăn trong ngày được chọn)
    const pieData =
        selectedDate && groupedMeals[selectedDate]
            ? groupedMeals[selectedDate]
            : [];

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
                {/* Thông tin tóm tắt */}
                <Col md={12}>
                    <Row className="g-3">
                        <Col md={4}>
                            <Card className="shadow-sm border-0 text-center p-3">
                                <FaUtensils size={30} className="text-primary mb-2"/>
                                <h6 className="fw-bold">Số ngày</h6>
                                <span className="fs-5">{days.length}</span>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="shadow-sm border-0 text-center p-3">
                                <FaChartBar size={30} className="text-danger mb-2"/>
                                <h6 className="fw-bold">Tổng Calo</h6>
                                <span className="fs-5 text-danger">{totalCalories} kcal</span>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="shadow-sm border-0 text-center p-3">
                                <FaChartPie size={30} className="text-success mb-2"/>
                                <h6 className="fw-bold">Trung bình/ Ngày</h6>
                                <span className="fs-5 text-success">{avgCalories} kcal</span>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* Bảng dữ liệu nhóm theo ngày */}
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="fw-bold bg-light">
                            📋 Danh sách bữa ăn theo ngày
                        </Card.Header>
                        <Card.Body style={{maxHeight: "400px", overflowY: "auto"}}>
                            {days.length > 0 ? (
                                <Accordion alwaysOpen>
                                    {days.map((date, idx) => (
                                        <Accordion.Item eventKey={String(idx)} key={idx}>
                                            <Accordion.Header onClick={() => setSelectedDate(date)}>
                                                {date} –{" "}
                                                <Badge bg="info">
                                                    {groupedMeals[date].reduce((s: number, m: any) => s + m.calories, 0)} kcal
                                                </Badge>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Table striped hover responsive className="align-middle text-center">
                                                    <thead className="table-light">
                                                    <tr>
                                                        <th>Món</th>
                                                        <th>Calo</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {groupedMeals[date].map((meal: any, i: number) => (
                                                        <tr key={i}>
                                                            <td>{meal.foodName}</td>
                                                            <td>
                                                                <Badge
                                                                    bg={
                                                                        meal.calories > 500
                                                                            ? "danger"
                                                                            : meal.calories > 300
                                                                                ? "warning"
                                                                                : "success"
                                                                    }
                                                                >
                                                                    {meal.calories} kcal
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            ) : (
                                <p className="text-muted text-center">Không có dữ liệu 🍽️</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Biểu đồ Calo theo ngày */}
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="fw-bold bg-light">
                            📊 Calo theo ngày
                        </Card.Header>
                        <Card.Body style={{height: "350px"}}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="date"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Bar dataKey="totalCalories" fill="#0d6efd" radius={[6, 6, 0, 0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted text-center">Không có dữ liệu 📉</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Biểu đồ tròn theo ngày được chọn */}
                <Col md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="fw-bold bg-light">
                            🥗 Tỷ lệ calo theo món ({selectedDate || "Chưa chọn"})
                        </Card.Header>
                        <Card.Body style={{height: "300px"}}>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="calories"
                                            nameKey="foodName"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {pieData.map((_: any, idx: number) => (
                                                <Cell
                                                    key={idx}
                                                    fill={COLORS[idx % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip/>
                                        <Legend/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted text-center">Không có dữ liệu 🍩</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DailyMealComponent;
