// src/services/adn.service.js
import axiosClient from "./apiClient";

export const adnService = {
    lantikAhli,
    getADN,
    maklumatAhliADN,
    kemaskiniAhliADN,
    nyahAktif,
    senaraiLaporan,
    updateCatatan,
};

function updateCatatan(data) {
    return axiosClient.post('/pelantikan/adn/kemaskini-catatan', data);
}

function lantikAhli(formData) {
    return axiosClient.post('pelantikan/adn/lantik', formData);
}


function getADN({ page = 1, perPage = 5, search = '', jenis_adn = '0' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    if (jenis_adn !== '0') {
        params.jenis_pelantikan = jenis_adn;
    }

    return axiosClient
        .get('/pelantikan/adn', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching ADN:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}


function senaraiLaporan() {
    return axiosClient.get('/pelantikan/adn/senarai-laporan')
        .catch(e => {
            console.error('Error fetching DUN:', e);
            throw e;
        });
}

function maklumatAhliADN(id) {
    return axiosClient.get(`pelantikan/adn/papar`, {
        params: { id }
    });
}

function kemaskiniAhliADN(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/adn/${id}`, formData);
}

function nyahAktif(id) {
    return axiosClient.put(`pelantikan/adn/nyah-aktif/${id}`)
}