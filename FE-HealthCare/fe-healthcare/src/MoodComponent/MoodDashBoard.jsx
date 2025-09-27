import {useEffect} from "react";
import Footer from "../HomeComponent/common/Footer";
import SideBar from "../HomeComponent/common/SideBar";
import {Navbar} from "react-bootstrap";
import MoodComponent from "./component/MoodComponent";
export default function MoodDashBoard() {
    useEffect(() => {
        document.title = "Mood";
    }, []);

    return (
        <div id="page-top" className="d-flex flex-column min-vh-100">
            {/* Navbar cố định trên cùng */}
            <Navbar/>

            {/* Nội dung chính gồm Sidebar + Content */}
            <div id="wrapper" className="d-flex flex-grow-1">
                {/* Sidebar bên trái */}
                <SideBar/>

                {/* Content bên phải */}
                <div className="flex-grow-1 p-3" style={{marginLeft: "30px"}}>
                    <MoodComponent/>
                </div>
            </div>

            {/* Footer cuối trang */}
            <Footer/>
        </div>
    );
}