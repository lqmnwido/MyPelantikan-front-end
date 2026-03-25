// src/services/tyt.service.js
import axiosClient from "./apiClient";

export const tytService = {
    lantikAhliTYT,
    senaraiTYT,
    maklumatAhliTYT,
    kemaskiniAhliTYT,
    nyahAktif
};

function lantikAhliTYT(formData) {
    return axiosClient.post('pelantikan/tyt/lantik', formData);
}


function senaraiTYT({ page = 1, perPage = 5, search = '', jenis_adn = '0' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    if (jenis_adn !== '0') {
        params.jenis_pelantikan = jenis_adn;
    }

    return axiosClient
        .get('/pelantikan/tyt', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatAhliTYT(id) {
    return axiosClient.get(`pelantikan/tyt/papar`, {
        params: { id }
    });
}

function kemaskiniAhliTYT(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/tyt/${id}`, formData);
}

function nyahAktif(id) {
    return axiosClient.put(`pelantikan/tyt/nyah-aktif/${id}`)
}