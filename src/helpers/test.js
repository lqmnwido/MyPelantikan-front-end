import axios from 'axios';
import router from '@/router';

const api = process.env.VUE_APP_APIKEY;

const axiosClient = axios.create({
    baseURL: api,
    withCredentials: true,
    withXSRFToken: true,
});

axiosClient.interceptors.request.use((response) => {
    return response;
}, error => {
    if (error.response.status && error.response === 401) {
        // auto logout if 401 response returned from api
        router.push('/login');
    }
    throw error;
})
