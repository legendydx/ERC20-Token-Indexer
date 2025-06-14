import axios from "axios";
import {base_url} from "../../utils/axiosConfig"

const register = async (userData) => {
    const response = await axios.post(`${base_url}user/register`, userData);
    if (response.data) {
        if (response.data) {
            localStorage.setItem("customer", JSON.stringify(response.data));
        }
        return response.data;
    }
};




export const authService = {
    register,
  
}