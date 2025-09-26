// import {useEffect, useState} from "react";
// import * as DaiLyMealService from "../service/DailyMealService";
// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     ResponsiveContainer,
// } from "recharts";
// import {Card, Col, Container, Row, Table} from "react-bootstrap";
// const userId = localStorage.getItem('id');
// const DailyMealComponent = () => {
//     const [dailyMeals, setDailyMeals] = useState([]);
//
//     useEffect(() => {
//         getDailyMeals(userId);
//     }, []);
//
//     const getDailyMeals = async (userId) => {
//         try {
//             let allDailyMeals = await DaiLyMealService.getAllDailyMealsByUserId(userId);
//             setDailyMeals(allDailyMeals);
//         }catch (error) {
//             console.error('Error fetching daily meals:', error);
//         }
//     }
//
//     return (
//         <Container className="mt-4">
//             <Row>
//                 {/* Bảng dữ liệu */}
//                 <Col md={6} className="mb-4">
//                     <Card>
//                         <Card.Header className="fw-bold">Danh sách bữa ăn</Card.Header>
//                         <Card.Body>
//                             <Table striped bordered hover responsive>
//                                 <thead>
//                                 <tr>
//                                     <th>Tên món ăn</th>
//                                     <th>Calo</th>
//                                     <th>Ngày ghi nhận</th>
//                                 </tr>
//                                 </thead>
//                                 <tbody>
//                                 {dailyMeals.map((meal, index) => (
//                                     <tr key={index}>
//                                         <td>{meal.foodName}</td>
//                                         <td>{meal.calories}</td>
//                                         <td>{new Date(meal.recordAt).toLocaleDateString()}</td>
//                                     </tr>
//                                 ))}
//                                 </tbody>
//                             </Table>
//                         </Card.Body>
//                     </Card>
//                 </Col>
//
//                 {/* Biểu đồ */}
//                 <Col md={6} className="mb-4">
//                     <Card>
//                         <Card.Header className="fw-bold">Biểu đồ Calo theo món ăn</Card.Header>
//                         <Card.Body style={{ height: "350px" }}>
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <BarChart data={dailyMeals}>
//                                     <CartesianGrid strokeDasharray="3 3" />
//                                     <XAxis dataKey="foodName" />
//                                     <YAxis />
//                                     <Tooltip />
//                                     <Bar dataKey="calories" fill="#0d6efd" />
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </Card.Body>
//                     </Card>
//                 </Col>
//             </Row>
//         </Container>
//     );
// }
// export default DailyMealComponent;
import { useEffect, useState } from "react";
import * as DailyMealService from "../service/DailyMealService";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, Col, Container, Row, Table, Spinner } from "react-bootstrap";

const DailyMealComponent = () => {
    const userId = localStorage.getItem("id");
    const [dailyMeals, setDailyMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            getDailyMeals(userId);
        }
    }, [userId]);

    const getDailyMeals = async (userId: string) => {
        try {
            const allDailyMeals = await DailyMealService.getAllDailyMealsByUserId(userId);

            // Nếu API trả object thay vì array thì nhớ bóc tách đúng field
            setDailyMeals(Array.isArray(allDailyMeals) ? allDailyMeals : []);
        } catch (error) {
            console.error("Error fetching daily meals:", error);
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
        <Container fluid className="mt-4">
            <Row className="g-4">
                {/* Bảng dữ liệu */}
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="fw-bold bg-light">
                            📋 Danh sách bữa ăn
                        </Card.Header>
                        <Card.Body>
                            <Table striped hover responsive className="align-middle text-center shadow-sm rounded">
                                <thead className="table-primary">
                                <tr>
                                    <th>Tên món ăn</th>
                                    <th>Calo</th>
                                    <th>Ngày ghi nhận</th>
                                </tr>
                                </thead>
                                <tbody>
                                {dailyMeals.length > 0 ? (
                                    dailyMeals.map((meal, index) => (
                                        <tr key={index}>
                                            <td className="fw-semibold">{meal.foodName}</td>
                                            <td className="text-danger fw-bold">{meal.calories}</td>
                                            <td>
                                                {meal.recordedAt
                                                    ? new Date(meal.recordedAt).toLocaleDateString("vi-VN")
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center text-muted py-4">
                                            Không có dữ liệu 🍽️
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Biểu đồ */}
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="fw-bold bg-light">
                            📊 Biểu đồ Calo theo món ăn
                        </Card.Header>
                        <Card.Body style={{ height: "350px" }}>
                            {dailyMeals.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyMeals}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="foodName" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar
                                            dataKey="calories"
                                            fill="#0d6efd"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <p className="text-muted">Không có dữ liệu để hiển thị 📉</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DailyMealComponent;
