// src/services/kehakiman.service.js
import axiosClient from "./apiClient";

export const kehakimanService = {
    getHMR,
    lantikAhliHMR,
    maklumatAhliHMR,
    kemaskiniAhliHMR,
    nyahAktifHMR,
    getHMT,
    lantikAhliHMT,
    maklumatAhliHMT,
    kemaskiniAhliHMT,
    nyahAktifHMT,
    getHMP,
    lantikAhliHMP,
    maklumatAhliHMP,
    kemaskiniAhliHMP,
    nyahAktifHMP,
};

function lantikAhliHMR(formData) {
    return axiosClient.post('pelantikan/hmr/lantik', formData);
}

function getHMR({ page = 1, perPage = 5, search = '' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('/pelantikan/hmr', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatAhliHMR(id) {
    return axiosClient.get(`pelantikan/hmr/papar`, {
        params: { id }
    });
}

function nyahAktifHMR(id) {
    return axiosClient.put(`pelantikan/hmr/nyah-aktif/${id}`)
}

function kemaskiniAhliHMR(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/hmr/${id}`, formData);
}

function lantikAhliHMT(formData) {
    return axiosClient.post('pelantikan/hmt/lantik', formData);
}

function getHMT({ page = 1, perPage = 5, search = '' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('/pelantikan/hmt', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}


function maklumatAhliHMT(id) {
    return axiosClient.get(`pelantikan/hmt/papar`, {
        params: { id }
    });
}

function nyahAktifHMT(id) {
    return axiosClient.put(`pelantikan/hmt/nyah-aktif/${id}`)
}

function kemaskiniAhliHMT(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/hmt/${id}`, formData);
}

function lantikAhliHMP(formData) {
    return axiosClient.post('pelantikan/hmp/lantik', formData);
}

function getHMP({ page = 1, perPage = 5, search = '' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('/pelantikan/hmp', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}


function maklumatAhliHMP(id) {
    return axiosClient.get(`pelantikan/hmp/papar`, {
        params: { id }
    });
}

function nyahAktifHMP(id) {
    return axiosClient.put(`pelantikan/hmp/nyah-aktif/${id}`)
}

function kemaskiniAhliHMP(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/hmp/${id}`, formData);
}
