// src/services/akta.service.js
import axiosClient from "./apiClient";

export const aktaService = {
    lantikAhliNFCC,
    senaraiNFCC,
    maklumatAhliNFCC,
    kemaskiniAhliNFCC,
    nyahAktif
};

function lantikAhliNFCC(formData) {
    return axiosClient.post('pelantikan/nfcc/lantik', formData);
}


function senaraiNFCC({ page = 1, perPage = 5, search = '', jenis_adn = '0' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    if (jenis_adn !== '0') {
        params.jenis_pelantikan = jenis_adn;
    }

    return axiosClient
        .get('/pelantikan/nfcc', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatAhliNFCC(id) {
    return axiosClient.get(`pelantikan/nfcc/papar`, {
        params: { id }
    });
}

function kemaskiniAhliNFCC(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/nfcc/${id}`, formData);
}

function nyahAktif(id) {
    return axiosClient.put(`pelantikan/nfcc/nyah-aktif/${id}`)
}