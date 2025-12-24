import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor Request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor Response
axiosClient.interceptors.response.use(
    (response) => { //Get data if success
        return response.data;
    },
    (error) => { //Handle error
        if (error.response?.status === 401){ 
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
)

export default axiosClient;

