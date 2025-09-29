import axios from "axios";

export const getAllMoodsByUserId = async (userId) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.get(`http://localhost:1010/api/moodtrackings/${userId}`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching mood trackings:", error);
    }
}

export const updateMoodTracking = async (userId, moodTrackingId, moodTrackingData) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.put(`http://localhost:1010/api/moodtrackings/${userId}/${moodTrackingId}`, moodTrackingData, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error updating mood tracking:", error);
    }
}

export const createMoodTracking = async (moodTrackingData) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.post(`http://localhost:1010/api/moodtrackings-create`, moodTrackingData, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error creating mood tracking:", error);
    }
}

export const deleteMoodTracking = async (moodTrackingId) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.delete(`http://localhost:1010/api/moodtrackings/${moodTrackingId}`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting mood tracking:", error);
    }
}