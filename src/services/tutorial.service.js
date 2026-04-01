// src/services/tutorial.service.js
import axiosClient from "./apiClient";

export const tutorialService = {
    getTutorials,
    getTutorialById,
    createTutorial,
    updateTutorial,
    deleteTutorial
};

function getTutorials({ page = 1, perPage = 5, search = '' } = {}) {
  return axiosClient.get('/tutorials', {params: {page,per_page: perPage,search,},})
    .then(r => r.data)
    .catch(e => {
      console.error('Error fetching profiles:', e);
      return { data: [], total: 0, current_page: 1, per_page: perPage };
    });
}


export function getTutorialById(id) {
  return axiosClient.get(`tutorials/${id}`);
}

function createTutorial(formData) {
  return axiosClient.post('tutorials/tambah', formData);
}

function updateTutorial(id, formData) {
    formData.append('_method', 'PUT'); // Spoof the PUT request

    return axiosClient.post(`tutorials/${id}`, formData);
}

function deleteTutorial(id) {
  return axiosClient.delete(`tutorials/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}
