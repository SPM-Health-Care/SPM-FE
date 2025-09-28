import axios from "axios";

export const getAllRemindersByUserId = async (userId) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.get(`http://localhost:1010/api/reminders/${userId}`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching reminders:", error);
    }
}

export const getAllReminderTypes = async () => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.get(`http://localhost:1010/api/remindertypes`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching reminder types:", error);
    }
}

export const createReminder = async (reminderData) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.post(`http://localhost:1010/api/reminders-create`, reminderData, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    }catch (error) {
        console.error("Error creating reminder:", error);
    }
}

export const updateStatusReminder = async (userId, reminderId, reminderData) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.put(`http://localhost:1010/api/reminders/${userId}/${reminderId}`, reminderData, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    }catch (error) {
        console.error("Error updating reminder status:", error);
    }
}