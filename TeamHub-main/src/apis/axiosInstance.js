import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    timeout: 10000, // Set a timeout of 10 seconds
    withCredentials: true, // Include credentials in requests
});

axiosInstance.interceptors.request.use(
    (config) => {
        // You can add any request modifications here, like adding headers
        const token = localStorage.getItem("user");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }       
);
axiosInstance.interceptors.response.use(
    (response) => {
        // You can modify the response here if needed
        return response;
    },
    (error) => {
        // Handle response errors
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            console.error("Unauthorized access - redirecting to login");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

