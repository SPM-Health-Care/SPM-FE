import UserService from "../service/UserService";
import {Navigate, Outlet} from "react-router-dom";

export const PrivateRoutes = () => {
    if (!UserService.isAuthenticated()) {
        return <Navigate to="/login" />;
    }
    return <Outlet />;
}