import axios from "axios";

export const getAllDailyMealsByUserId = async (userId) => {
    try {
        const token = localStorage.getItem("token");
        let response = await axios.get(`http://localhost:1010/api/dailymeals/${userId}`, {
            headers : {Authorization: `Bearer ${token}`},
        });
        return response.data;
    }catch (error) {
        console.error("Error fetching daily meals:", error);
    }
}