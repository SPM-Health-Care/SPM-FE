import axios from "axios";
import Swal from "sweetalert2";

class UserService {
    static BASE_URL = "http://localhost:1010"

    static async login(username, password) {
        try {
            const response = await axios.post(`${UserService.BASE_URL}/auth/token`, {username, password})
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    /**AUTHENTICATION CHECKER */
    static logout() {
        localStorage.clear();
        Swal.fire(
            'Logged out!',
            'You have been logged out.',
            'success'
        );
    }

    static isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    }

    static isAdmin() {
        const role = localStorage.getItem('role')
        return role === 'ADMIN'
    }

    static isUser() {
        const role = localStorage.getItem('role')
        return role === 'USER'
    }

    static adminOnly() {
        return this.isAuthenticated() && this.isAdmin();
    }

    static UserOnly() {
        return this.isAuthenticated() && this.isUser();
    }

}

export default UserService;