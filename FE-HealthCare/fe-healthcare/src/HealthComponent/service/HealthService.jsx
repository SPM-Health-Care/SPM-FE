import axios from "axios";

export const getAllHealthMetricsByUserId = async (userId) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.get(`http://localhost:1010/api/healthmetrics/${userId}`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching health metrics:", error);
    }
}

export const getHealthGoalsByUserId = async (userId) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.get(`http://localhost:1010/api/healthgoals/${userId}`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching health goals:", error);
    }
}
