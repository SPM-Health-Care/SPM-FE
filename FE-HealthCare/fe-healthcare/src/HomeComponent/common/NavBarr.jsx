import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Bell, PersonCircle } from "react-bootstrap-icons";

const Navbarr = () => {
    return (
        <Navbar bg="light" expand="lg" className="shadow-sm">
            <Container fluid>
                <Navbar.Brand href="#">Health Care</Navbar.Brand>
                <Nav className="ms-auto d-flex align-items-center">
                    <Nav.Link href="#"><Bell size={20} /></Nav.Link>
                    <Nav.Link href="#"><PersonCircle size={24} /> Username</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default Navbarr;