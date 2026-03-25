// src/services/suruhanjaya.service.js
import axiosClient from "./apiClient";

export const suruhanjayaService = {
    getSPA,
    lantikAhliSPA,
    maklumatAhliSPA,
    kemaskiniAhliSPA,
    nyahAktifSPA,
    getSPR,
    lantikAhliSPR,
    maklumatAhliSPR,
    kemaskiniAhliSPR,
    nyahAktifSPR,
    getSPKP,
    lantikAhliSPKP,
    maklumatAhliSPKP,
    kemaskiniAhliSPKP,
    nyahAktifSPKP,
};

function lantikAhliSPA(formData) {
    return axiosClient.post('pelantikan/spa/lantik', formData);
}

function getSPA({ page = 1, perPage = 5, search = '' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('/pelantikan/spa', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatAhliSPA(id) {
    return axiosClient.get(`pelantikan/spa/papar`, {
        params: { id }
    });
}

function nyahAktifSPA(id) {
    return axiosClient.put(`pelantikan/spa/nyah-aktif/${id}`)
}

function kemaskiniAhliSPA(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/spa/${id}`, formData);
}

function lantikAhliSPR(formData) {
    return axiosClient.post('pelantikan/spr/lantik', formData);
}

function getSPR({ page = 1, perPage = 5, search = '' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('/pelantikan/spr', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatAhliSPR(id) {
    return axiosClient.get(`pelantikan/spr/papar`, {
        params: { id }
    });
}

function nyahAktifSPR(id) {
    return axiosClient.put(`pelantikan/spr/nyah-aktif/${id}`)
}

function kemaskiniAhliSPR(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/spr/${id}`, formData);
}


function lantikAhliSPKP(formData) {
    return axiosClient.post('pelantikan/spkp/lantik', formData);
}

function getSPKP({ page = 1, perPage = 5, search = '' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('/pelantikan/spkp', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatAhliSPKP(id) {
    return axiosClient.get(`pelantikan/spkp/papar`, {
        params: { id }
    });
}

function nyahAktifSPKP(id) {
    return axiosClient.put(`pelantikan/spkp/nyah-aktif/${id}`)
}

function kemaskiniAhliSPKP(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/spkp/${id}`, formData);
}
