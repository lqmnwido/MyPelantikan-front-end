// src/services/lookup.service.js
import axiosClient from "./apiClient";

export const pengurusanDokumenService = {
  simpanDokumen,
  senaraiPenerima,

};

function simpanDokumen(formData) {

  return axiosClient.post('pelantikan/pengurusan-dokumen/simpan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
}

function senaraiPenerima({ page = 1, perPage = 1000, search = '' } = {}) {
  return axiosClient
    .get('pelantikan/pengurusan-dokumen', {
      params: {
        page,
        per_page: perPage,
        search,
      },
    })
    .then(r => r.data)
    .catch(e => {
      console.error('Error fetching profiles:', e);
      return { data: [], total: 0, current_page: 1, per_page: perPage };
    });
}