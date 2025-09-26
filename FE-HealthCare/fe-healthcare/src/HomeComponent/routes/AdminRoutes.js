import UserService from "../service/UserService";
import {Navigate, Outlet} from "react-router-dom";

export const AdminRoutes = () => {
    if (!UserService.isAdmin()) {
        UserService.logout();
        return <Navigate to="/login" />;
    }
    return <Outlet />;
}