// src/services/dashboard.service.js
import axiosClient from "./apiClient";

export const dashboardService = {
    jumlahAhli,
    statistikParti,
};

function jumlahAhli() {
    return axiosClient.get(`/dashboard/jumlah-ahli`);
}

function statistikParti(payload) {
    return axiosClient.get(`/dashboard/statistik-parti`, { params: payload });
}
