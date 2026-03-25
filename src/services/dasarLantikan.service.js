// src/services/dasarLantikan.service.js
import axiosClient from "./apiClient";

export const dasarLantikanService = {
    simpanDokumen,
    senaraiDasarLantikan,
    maklumatDasarLantikan,
    kemaskiniDasarLantikan,
    hapusDasarLantikan
};

function simpanDokumen(formData) {

  return axiosClient.post('dasar-lantikan/simpan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
}


function senaraiDasarLantikan({ page = 1, perPage = 5, search = ''} = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };
    return axiosClient
        .get('/dasar-lantikan', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function maklumatDasarLantikan(id) {
  return axiosClient.get(`/dasar-lantikan/${id}`);
}


function kemaskiniDasarLantikan(id, formData) {
  formData.append('_method', 'PUT'); // Spoof the PUT request

  return axiosClient.post(`/dasar-lantikan/kemaskini/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

function hapusDasarLantikan(id) {
    return axiosClient.delete(`dasar-lantikan/hapus/${id}`)
}