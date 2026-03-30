import axiosClient from "./apiClient";

export const auditService = {
    getAllLogs,
    getMyLogs
};

function getAllLogs(params = {}) {
    return axiosClient.get('/audit/all', { params })
        .then(response => response.data);
}

function getMyLogs(params = {}) {
    return axiosClient.get('/audit/me', { params })
        .then(response => response.data);
}
