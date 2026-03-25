// src/services/lookup.service.js
import axiosClient from "./apiClient";

export const carianService = {
  senaraiCarian,
};

function senaraiCarian({ page = 1, perPage = 5, search = '' } = {}) {
  return axiosClient
    .get('/carian', {
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

