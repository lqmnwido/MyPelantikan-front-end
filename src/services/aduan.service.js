// src/services/aduan.service.js
import axiosClient from "./apiClient";

export const aduanService = {
    tambahAduan,
    senaraiAduan,
    hapusAduan
};

function tambahAduan(formData) {

  return axiosClient.post('aduan/tambah', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
}


function senaraiAduan({ page = 1, perPage = 5, search = ''} = {}) {
    const params = {
        page,
        per_page: perPage,
        search,
    };
    return axiosClient
        .get('/aduan', { params })
        .then(r => r.data)
        .catch(e => {
            console.error('Error fetching profiles:', e);
            return { data: [], total: 0, current_page: 1, per_page: perPage };
        });
}

function hapusAduan(id) {
    return axiosClient.delete(`aduan/hapus/${id}`)
}