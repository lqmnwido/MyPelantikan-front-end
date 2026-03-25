// src/services/resume.service.js
import axiosClient from "./apiClient";

export const resumeService = {
  getResume,
  updateLampiran,
  updateJawatanLabel,
};

function getResume(id) {
  return axiosClient
    .get(`/resume/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("Error fetching resume:", err);
      throw err;
    });
}

function updateLampiran(id, lampiran) {
  return axiosClient
    .put(`/resume/${id}/lampiran`, { lampiran })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Error updating lampiran:", err);
      throw err;
    });
}

function updateJawatanLabel(id, jawatanLabel) {
  return axiosClient
    .put(`/resume/${id}/jawatan-label`, { jawatanLabel })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Error updating jawatanLabel:", err);
      throw err;
    });
}
