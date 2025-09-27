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

export const updateGoal = async (userId, goalData) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.put(`http://localhost:1010/api/goals/${userId}`, goalData, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error updating goal:", error);
    }
};

export const updateHealthMetric = async (userId,recordedAt, metricData) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.put(`http://localhost:1010/api/metrics/${userId}/${recordedAt}`, metricData, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error updating health metric:", error);
    }
}
