// src/services/adn.service.js
import axiosClient from "./apiClient";

export const notifikasiService = {
    senaraiNotifikasi,
    senaraiNotifikasiDashboard,
    hapusNotifikasi
};

function senaraiNotifikasi({ page = 1, perPage = 5, search = ''} = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('notifikasi/', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function senaraiNotifikasiDashboard() {
    return axiosClient.get(`notifikasi/dashboard`)
}

function hapusNotifikasi(id) {
    return axiosClient.put(`notifikasi/${id}`)
}