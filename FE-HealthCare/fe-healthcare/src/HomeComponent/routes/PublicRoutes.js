import Swal from "sweetalert2";
import {Navigate, Outlet} from "react-router-dom";

export const PublicRoutes = () => {
    if (localStorage.getItem('token')) {
        Swal.fire({
            title: 'Please logout before',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return <Navigate to="/user/profile" />;
    }
    return <Outlet />;
}