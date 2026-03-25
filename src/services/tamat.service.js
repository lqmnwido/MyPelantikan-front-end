// src/services/tamat.service.js
import axiosClient from "./apiClient";

export const tamatService = {
    getTamatTempoh,
    uploadExcel,
    hapusRekod,
    kemaskini,
    maklumat
};

function getTamatTempoh({ page = 1, perPage = 5, search = '', sortBy = 'tarikh_tamat', sortDesc = 'asc' } = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
        sort_by: sortBy,
        sort_desc: sortDesc,
    };

    return axiosClient
        .get('/pelantikan/tamat-tempoh', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

// ✅ Excel upload
function uploadExcel(data) {
    return axiosClient
        .post('/pelantikan/tamat-tempoh/upload', { data })
        .then(r => r.data)
        .catch(e => {
            console.error('Error uploading Excel:', e.response?.data || e);
            throw e;
        });
}

async function hapusRekod(id) {
    try {
        const { data } = await axiosClient.delete(`/pelantikan/tamat-tempoh/${id}`);
        return data;
    } catch (e) {
        console.error('Error deleting template', e);
    }
}


function kemaskini(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`pelantikan/tamat-tempoh/${id}`, formData);
}

function maklumat(id) {
    return axiosClient.get(`pelantikan/tamat-tempoh/papar`, {
        params: { id }
    });
}
