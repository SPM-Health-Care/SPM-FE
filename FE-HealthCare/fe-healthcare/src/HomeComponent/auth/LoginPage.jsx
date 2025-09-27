import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {toast} from "react-toastify";
import UserService from "../service/UserService";
import * as Yup from "yup";

import logo from '../assets/img/logo/logo.jpg'; // Import the image
import theme from "../assets/img/bgLogin/theme.jpg";
import {Alert, Button, Card, Col, Container, Form, Image, InputGroup, Row} from "react-bootstrap";
import {ErrorMessage, Field, Form as FormikForm, Formik} from "formik";
import {LockFill, PersonFill} from "react-bootstrap-icons";

let count = 3;
const validationSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username is required'),
    password: Yup.string().required('Password is required')
});

function LoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const sessionTimeout = 60000; // 1 phút

    useEffect(() => {
        document.title = "Login";
        const maxAttemptsExceeded = sessionStorage.getItem('maxAttemptsExceeded');
        if (maxAttemptsExceeded) {
            setError('You have exceeded the maximum number of attempts, please wait for 1 minute.');
            setTimeout(() => {
                sessionStorage.removeItem('maxAttemptsExceeded');
                count = 3;
                setError('');
            }, sessionTimeout);
        }
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true);

        if (sessionStorage.getItem('maxAttemptsExceeded')) {
            setError('You have exceeded the maximum number of attempts, please wait for 1 minute.');
            setLoading(false);
            return;
        }

        if (count === 1) {
            setError('You have exceeded the maximum number of attempts, please wait for 1 minute.');
            setLoading(false);
            sessionStorage.setItem('maxAttemptsExceeded', 'true');
            setTimeout(() => {
                sessionStorage.removeItem('maxAttemptsExceeded');
                count = 3;
                setError('');
            }, sessionTimeout);
            return;
        }

        try {
            const userData = await UserService.login(values.username, values.password);

            if (userData.result && userData.result.token) {
                localStorage.setItem('token', userData.result.token);
                localStorage.setItem('authenticated', userData.result.authenticated);
                localStorage.setItem('role', userData.result.role);
                localStorage.setItem('id', userData.result.id);
                navigate(`/health`);

                toast.success("Login successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    style: {backgroundColor: '#28a745', color: '#fff', fontWeight: 'bold'}
                });
            } else {
                count--;
                setError(`Invalid username or password, ${count} attempts left`);
            }
        } catch (error) {
            console.log(error);
            setError(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="login-page min-vh-100 d-flex align-items-center"
            style={{
                backgroundImage: `url(${theme})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
            }}
        >
            {/* Overlay mờ để form rõ hơn */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.5)", // lớp mờ đen 50%
                    zIndex: 0,
                }}
            />
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        {/* Logo + Welcome */}
                        <div className="text-center mb-4 text-white">
                            <Image src={logo} alt="logo" width={100} className="mb-3 " rounded={true}/>
                            <h2 className="fw-bold">
                                Welcome to <span className="text-decoration-line-through">Health Care</span>
                            </h2>
                        </div>

                        {/* Login Card */}
                        <Card className="shadow-lg border-0 rounded-4">
                            <Card.Body className="p-4">
                                <h4 className="text-center text-dark mb-4">Log in</h4>

                                <Formik
                                    initialValues={{username: "", password: ""}}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({values}) => (
                                        <FormikForm>
                                            {/* Username */}
                                            <Form.Group className="mb-3" controlId="username">
                                                <Form.Label>Username</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <PersonFill/>
                                                    </InputGroup.Text>
                                                    <Field
                                                        as={Form.Control}
                                                        type="text"
                                                        name="username"
                                                        placeholder="Enter username..."
                                                    />
                                                </InputGroup>
                                                <ErrorMessage
                                                    name="username"
                                                    component="div"
                                                    className="text-danger small mt-1"
                                                />
                                            </Form.Group>

                                            {/* Password */}
                                            <Form.Group className="mb-3" controlId="password">
                                                <Form.Label>Password</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <LockFill/>
                                                    </InputGroup.Text>
                                                    <Field
                                                        as={Form.Control}
                                                        type="password"
                                                        name="password"
                                                        placeholder="Enter password..."
                                                    />
                                                </InputGroup>
                                                <ErrorMessage
                                                    name="password"
                                                    component="div"
                                                    className="text-danger small mt-1"
                                                />
                                            </Form.Group>

                                            {/* Remember + Forgot */}
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <Field
                                                    type="checkbox"
                                                    name="rememberMe"
                                                    as={Form.Check}
                                                    label="Remember me!"
                                                />
                                                <a
                                                    href="/forgot-password"
                                                    className="small text-decoration-none text-primary"
                                                >
                                                    Forgot Password?
                                                </a>
                                            </div>

                                            {/* Submit */}
                                            <div className="d-grid">
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    disabled={!values.username || !values.password || loading}
                                                >
                                                    {loading ? "Loading..." : "Login"}
                                                </Button>
                                            </div>
                                        </FormikForm>
                                    )}
                                </Formik>

                                {/* Error */}
                                {error && (
                                    <Alert variant="danger" className="mt-3">
                                        {error}
                                    </Alert>
                                )}

                                {/* Signup */}
                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        Don’t have an account?{" "}
                                        <a href="/signup" className="text-primary fw-semibold">
                                            Sign up
                                        </a>
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Footer */}
                        <p className="text-center mt-4 small text-light">
                            C08 Dev | All Rights Reserved © {new Date().getFullYear()}
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default LoginPage;

