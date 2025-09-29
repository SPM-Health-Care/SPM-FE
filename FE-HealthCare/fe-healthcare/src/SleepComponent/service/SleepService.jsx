import axios from "axios";

export const getAllSleepByUserId = async (userId) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.get(`http://localhost:1010/api/sleeptrackings/${userId}`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching sleep data:", error);
    }
}

export const updateSleep = async (userId, recordedAt, sleepData) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.put(`http://localhost:1010/api/sleeptrackings/${userId}/${recordedAt}`, sleepData, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error updating sleep data:", error);
    }
}

export const createSleep = async (sleepData) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.post("http://localhost:1010/api/sleeptrackings-create",
            sleepData,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating sleep data:", error);
    }
}

export const deleteSleep = async (sleepId) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.delete(`http://localhost:1010/api/sleeptrackings/${sleepId}`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting sleep data:", error);
    }
}