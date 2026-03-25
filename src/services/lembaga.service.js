// src/services/lembaga.service.js
import axiosClient from "./apiClient";

export const lembagaService = {
    getLembagaPenasihat,
    lantikAhliLembagaPenasihat,
    maklumatAhliLembagaPenasihat,
    nyahAktifLembagaPenasihat,
    kemaskiniAhliLembagaPenasihat,
    getLembagaPengampunan,
    lantikAhliLembagaPengampunan,
    maklumatAhliLembagaPengampunan,
    nyahAktifLembagaPengampunan,
    kemaskiniAhliLembagaPengampunan,
};

function lantikAhliLembagaPenasihat(formData) {
    return axiosClient.post('pelantikan/lpjpm/lantik', formData);
}

function getLembagaPenasihat({ page = 1, perPage = 5, search = '' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('/pelantikan/lpjpm', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatAhliLembagaPenasihat(id) {
    return axiosClient.get(`pelantikan/lpjpm/papar`, {
        params: { id }
    });
}

function nyahAktifLembagaPenasihat(id) {
    return axiosClient.put(`pelantikan/lpjpm/nyah-aktif/${id}`)
}

function kemaskiniAhliLembagaPenasihat(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/lpjpm/${id}`, formData);
}

function lantikAhliLembagaPengampunan(formData) {
    return axiosClient.post('pelantikan/lpwp/lantik', formData);
}

function getLembagaPengampunan({ page = 1, perPage = 5, search = '' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };

    return axiosClient
        .get('/pelantikan/lpwp', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatAhliLembagaPengampunan(id) {
    return axiosClient.get(`pelantikan/lpwp/papar`, {
        params: { id }
    });
}

function nyahAktifLembagaPengampunan(id) {
    return axiosClient.put(`pelantikan/lpwp/nyah-aktif/${id}`)
}

function kemaskiniAhliLembagaPengampunan(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/lpwp/${id}`, formData);
}
